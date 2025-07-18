'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentData {
  amount: number;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  tableNumber?: number;
}

interface PaymentProcessorProps {
  paymentData: PaymentData;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

interface PaymentFormProps extends PaymentProcessorProps {}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentData,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Card element not found');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create payment intent on the server
      const response = await fetch('/api/restaurant/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          orderId: paymentData.orderId,
          orderNumber: paymentData.orderNumber,
          metadata: {
            customerName: paymentData.customerName,
            tableNumber: paymentData.tableNumber,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentData.customerName || 'Restaurant Customer',
          },
        },
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Payment failed');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Payment processing failed';
      setErrorMessage(errorMsg);
      onPaymentError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: '#ffffff',
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
    hidePostalCode: false,
  };

  if (paymentStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Payment Successful!</h3>
        <p className="text-slate-600 mb-4">Order #{paymentData.orderNumber} has been paid</p>
        <p className="text-2xl font-bold text-green-600 mb-6">
          ${(paymentData.amount / 100).toFixed(2)}
        </p>
        <Button
          onClick={onPaymentSuccess}
          leftIcon={<Receipt className="w-4 h-4" />}
          className="bg-green-600 hover:bg-green-700"
        >
          Print Receipt
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Process Payment</h3>
        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <span>Order #{paymentData.orderNumber}</span>
          {paymentData.tableNumber && (
            <>
              <span>•</span>
              <span>Table {paymentData.tableNumber}</span>
            </>
          )}
        </div>
        <div className="text-3xl font-bold text-slate-800 mt-2">
          ${(paymentData.amount / 100).toFixed(2)}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Card Details
          </label>
          <div className="p-4 border border-slate-200 rounded-xl bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {paymentData.customerName && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={paymentData.customerName}
              disabled
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          leftIcon={
            isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )
          }
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? 'Processing...' : 'Process Payment'}
        </Button>
      </div>
    </form>
  );
};

const CashPaymentForm: React.FC<PaymentFormProps> = ({
  paymentData,
  onPaymentSuccess,
  onCancel
}) => {
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const orderTotal = paymentData.amount / 100;
  const receivedAmount = parseFloat(amountReceived) || 0;
  const changeAmount = receivedAmount - orderTotal;

  const handleCashPayment = async () => {
    if (receivedAmount < orderTotal) {
      return;
    }

    setIsProcessing(true);
    try {
      // Process cash payment
      const response = await fetch('/api/restaurant/payment/cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          orderNumber: paymentData.orderNumber,
          amountReceived: receivedAmount * 100, // Convert to cents
          changeGiven: Math.max(0, changeAmount) * 100,
          totalAmount: paymentData.amount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process cash payment');
      }

      const result = await response.json();
      onPaymentSuccess(result);
    } catch (error) {
      console.error('Cash payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Cash Payment</h3>
        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <span>Order #{paymentData.orderNumber}</span>
          {paymentData.tableNumber && (
            <>
              <span>•</span>
              <span>Table {paymentData.tableNumber}</span>
            </>
          )}
        </div>
        <div className="text-3xl font-bold text-slate-800 mt-2">
          ${orderTotal.toFixed(2)}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amount Received
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              step="0.01"
              min={orderTotal}
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {receivedAmount > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Order Total:</span>
              <span className="font-medium">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Amount Received:</span>
              <span className="font-medium">${receivedAmount.toFixed(2)}</span>
            </div>
            {changeAmount > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-700 font-medium">Change Due:</span>
                <span className="font-bold text-green-700 text-lg">${changeAmount.toFixed(2)}</span>
              </div>
            )}
            {changeAmount < 0 && (
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-700 font-medium">Amount Short:</span>
                <span className="font-bold text-red-700 text-lg">${Math.abs(changeAmount).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCashPayment}
          disabled={receivedAmount < orderTotal || isProcessing}
          leftIcon={
            isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )
          }
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </Button>
      </div>
    </div>
  );
};

export const PaymentProcessor: React.FC<PaymentProcessorProps> = (props) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="mb-6">
        <div className="flex space-x-2">
          <Button
            variant={paymentMethod === 'card' ? 'default' : 'outline'}
            onClick={() => setPaymentMethod('card')}
            leftIcon={<CreditCard className="w-4 h-4" />}
            size="sm"
            className="flex-1"
          >
            Card
          </Button>
          <Button
            variant={paymentMethod === 'cash' ? 'default' : 'outline'}
            onClick={() => setPaymentMethod('cash')}
            leftIcon={<DollarSign className="w-4 h-4" />}
            size="sm"
            className="flex-1"
          >
            Cash
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {paymentMethod === 'card' ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Elements stripe={stripePromise}>
              <PaymentForm {...props} />
            </Elements>
          </motion.div>
        ) : (
          <motion.div
            key="cash"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CashPaymentForm {...props} />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default PaymentProcessor;