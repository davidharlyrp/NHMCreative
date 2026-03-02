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
        const { orderId, amount, description, customer } = req.body;

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
            successRedirectUrl: `${req.headers.origin}/products`,
            failureRedirectUrl: `${req.headers.origin}/product-detail/${orderId}`, // Or similar error page
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

                await adminPb.collection('orders').update(external_id, {
                    status: 'paid',
                    paymentId: id
                });
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

app.listen(port, () => {
    console.log(`NHMCreative Payment Server running on http://localhost:${port}`);
});
