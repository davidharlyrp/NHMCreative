import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Xendit } from 'xendit-node';

dotenv.config();

const app = express();
const port = process.env.PORT || 2091;

app.use(cors());
app.use(express.json());

// Initialize Xendit
const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
});

const { Invoice } = xenditClient;

// Initialize PocketBase for backend use
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.VITE_POCKETBASE_URL);
// Note: We might need to auth as admin if the status update is restricted
// await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

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
        const { status, external_id, id } = req.body;
        console.log(`Payment Webhook Received: ID=${id}, ExternalID=${external_id}, Status=${status}`);

        if (status === 'PAID') {
            // Update PocketBase status
            try {
                await pb.collection('orders').update(external_id, {
                    status: 'paid',
                    xenditInvoiceId: id
                });
                console.log(`Order ${external_id} updated to PAID`);
            } catch (pbError: any) {
                console.error('PocketBase Update Error:', pbError);
            }
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
