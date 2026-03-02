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

app.listen(port, () => {
    console.log(`NHMCreative Payment Server running on http://localhost:${port}`);
});
