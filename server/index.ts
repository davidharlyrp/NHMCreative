import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Xendit } from 'xendit-node';

dotenv.config();

console.log('--- Server Internal Debug ---');
console.log('PB URL:', process.env.VITE_POCKETBASE_URL);
console.log('Admin Email:', process.env.PB_ADMIN_EMAIL ? 'Set' : 'MISSING');
console.log('Xendit Key:', process.env.XENDIT_SECRET_KEY ? 'Set' : 'MISSING');
console.log('-----------------------------');

const app = express();
const port = process.env.PORT || 2091;

app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Initialize Xendit
const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
});

const { Invoice } = xenditClient;

// Initialize PocketBase for backend use
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.VITE_POCKETBASE_URL);

// Function to get admin-authenticated PocketBase instance
async function getAdminPB() {
    if (process.env.PB_ADMIN_EMAIL && process.env.PB_ADMIN_PASSWORD) {
        await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);
    }
    return pb;
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Create Xendit Invoice
app.post('/api/payment/create', async (req, res) => {
    try {
        const { orderId, amount, description, customer, productSlug } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = {
            externalId: orderId,
            amount: Number(amount),
            description: description || 'Purchase from NHMCreative',
            invoiceDuration: 86400, // 24 hours
            customer: {
                givenNames: customer?.name || 'Customer',
                email: customer?.email || '',
            },
            currency: 'IDR',
            reminderTime: 1,
            successRedirectUrl: productSlug
                ? `${req.headers.origin}/product/${productSlug}?orderId=${orderId}`
                : `${req.headers.origin}/product-detail/${orderId}`,
            failureRedirectUrl: productSlug
                ? `${req.headers.origin}/product/${productSlug}?error=payment_failed`
                : `${req.headers.origin}/product-detail/${orderId}`, // Or similar error page
        };

        const response = await Invoice.createInvoice({ data });

        // Proactively update order in PocketBase with invoice URL and ID
        try {
            const adminPb = await getAdminPB();
            await adminPb.collection('orders').update(orderId, {
                paymentId: response.id,
                invoiceUrl: response.invoiceUrl,
                paymentMethod: 'xendit'
            });
            console.log(`Order ${orderId} updated with Invoice info.`);
        } catch (updateErr: any) {
            console.error('Failed to update order after invoice creation:', updateErr.message);
        }

        res.json({
            invoice_url: response.invoiceUrl,
            external_id: response.externalId,
            id: response.id
        });
    } catch (error: any) {
        console.error('Xendit Error:', error);
        res.status(500).json({
            error: 'Failed to create payment invoice',
            message: error.message
        });
    }
});

// Xendit Webhook Listener
app.post('/api/payment/webhook', async (req, res) => {
    try {
        const body = req.body;
        const { status, external_id, id } = body;
        console.log('--- Webhook Received ---');
        console.log('Status:', status);
        console.log('External ID (Order ID):', external_id);
        console.log('Xendit Invoice ID:', id);

        if (status === 'PAID' || status === 'SETTLED') {
            // Update PocketBase status
            try {
                console.log('Attempting to update PocketBase for Order:', external_id);
                const adminPb = await getAdminPB();

                // Final check: verify if the record exists first for better logging
                try {
                    await adminPb.collection('orders').getOne(external_id);
                    console.log('Record found in PocketBase. Proceeding with update...');
                } catch (findError: any) {
                    console.error(`CRITICAL: Order ID ${external_id} NOT FOUND in PocketBase!`);
                    throw findError;
                }

                // Get product information from the order
                const order = await adminPb.collection('orders').getOne(external_id);

                // Update Order status
                await adminPb.collection('orders').update(external_id, {
                    status: 'paid',
                    paymentId: id
                });

                // Increment salesCount for the product
                if (order.productId) {
                    await adminPb.collection('products').update(order.productId, {
                        'salesCount+': 1
                    });
                    console.log(`INCREMENTED: Product ${order.productId} salesCount by 1`);
                }
                console.log(`SUCCESS: Order ${external_id} updated to PAID`);
            } catch (pbError: any) {
                console.error('PocketBase Update FAILED:');
                console.error('- Status:', pbError.status);
                console.error('- Message:', pbError.message);
                console.error('- Data:', JSON.stringify(pbError.data || {}));
            }
        } else {
            console.log('Ignored webhook status:', status);
        }

        res.status(200).send('Webhook processed');
    } catch (error: any) {
        console.error('Webhook processing failed:', error);
        res.status(500).send('Internal Server Error');
    }
});

// MANUAL TEST ROUTE: Call this in your browser to test if status update works
// Example: https://api.nhmcreative.com/api/payment/test-update/your_order_id
app.get('/api/payment/test-update/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        console.log('--- Running Manual Update Test ---');
        const adminPb = await getAdminPB();
        const order = await adminPb.collection('orders').getOne(orderId);
        await adminPb.collection('orders').update(orderId, {
            status: 'paid'
        });

        // Also increment salesCount in manual test
        if (order.productId) {
            await adminPb.collection('products').update(order.productId, {
                'salesCount+': 1
            });
        }
        res.send(`Successfully updated order ${orderId} to paid manually!`);
    } catch (err: any) {
        console.error('Manual Update Failed:', err.message);
        res.status(500).send('Failed: ' + err.message);
    }
});

// Create Product Review and update product rating/reviewCount
app.post('/api/review/create', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        if (!productId || !userId || !rating) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const adminPb = await getAdminPB();

        // 1. Create the review
        const review = await adminPb.collection('review').create({
            productId,
            userId,
            userName,
            rating,
            comment
        });

        // 2. Fetch all reviews for this product to recalculate
        const allReviews = await adminPb.collection('review').getFullList({
            filter: `productId = "${productId}"`
        });

        const reviewCount = allReviews.length;
        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

        // 3. Update the product
        await adminPb.collection('products').update(productId, {
            rating: averageRating,
            reviewCount: reviewCount
        });

        console.log(`UPDATED: Product ${productId} - Rating: ${averageRating.toFixed(1)}, Count: ${reviewCount}`);

        res.json({ success: true, data: review });
    } catch (error: any) {
        console.error('Review Error:', error);
        res.status(500).json({
            error: 'Failed to create review and update product',
            message: error.message
        });
    }
});

// Sync all products with their current reviews (Utility route)
app.get('/api/reviews/sync-all', async (req, res) => {
    try {
        const adminPb = await getAdminPB();
        const products = await adminPb.collection('products').getFullList();
        const allReviews = await adminPb.collection('review').getFullList();

        const results = [];

        for (const product of products) {
            const productReviews = allReviews.filter(r => r.productId === product.id);
            const reviewCount = productReviews.length;
            const averageRating = reviewCount > 0
                ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : 0;

            await adminPb.collection('products').update(product.id, {
                rating: averageRating,
                reviewCount: reviewCount
            });

            results.push({ name: product.name, rating: averageRating, count: reviewCount });
        }

        res.json({ success: true, message: 'All products synced', results });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`NHMCreative Payment Server running on http://localhost:${port}`);
});
