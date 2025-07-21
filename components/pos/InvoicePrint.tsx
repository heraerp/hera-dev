/**
 * Invoice Print Component - PO Gold Standard Theme
 * Professional invoice printing with thermal and standard printer support
 */

"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  Download, 
  X, 
  Building, 
  Calendar, 
  CreditCard, 
  Hash,
  User,
  MapPin,
  Phone,
  Mail,
  Receipt,
  FileText,
  Info,
  CheckCircle
} from 'lucide-react';

export interface InvoiceData {
  orderNumber: string;
  date: string;
  time: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  restaurant: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst?: string;
    logo?: string;
  };
  order: {
    type: 'dine_in' | 'takeout' | 'delivery';
    tableNumber?: string;
    waiterName?: string;
    specialInstructions?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category?: string;
    notes?: string;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    discount?: number;
    serviceCharge?: number;
    total: number;
    gstBreakdown?: {
      cgst?: number;
      sgst?: number;
      igst?: number;
      rate: number;
    };
  };
  payment: {
    method: string;
    amount: number;
    reference?: string;
    change?: number;
  };
  footer?: {
    message?: string;
    returnPolicy?: string;
    website?: string;
  };
}

interface InvoicePrintProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  printFormat?: 'standard' | 'thermal' | 'both';
  autoprint?: boolean;
}

export default function InvoicePrintGoldStandard({ 
  invoice, 
  isOpen, 
  onClose, 
  printFormat = 'standard',
  autoprint = false 
}: InvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const thermalPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && autoprint) {
      handlePrint();
    }
  }, [isOpen, autoprint]);

  const handlePrint = () => {
    if (printFormat === 'thermal') {
      printThermalReceipt();
    } else if (printFormat === 'both') {
      printStandardInvoice();
      setTimeout(() => printThermalReceipt(), 1000);
    } else {
      printStandardInvoice();
    }
  };

  const printStandardInvoice = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.orderNumber}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #111827;
              background: #f9fafb;
              line-height: 1.6;
            }
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background: #f9fafb;
              padding: 30px;
              text-align: center; 
              border-bottom: 1px solid #e5e7eb;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: 700; 
              margin-bottom: 8px;
              color: #111827;
            }
            .company-details {
              color: #6b7280;
              font-size: 14px;
              line-height: 1.5;
            }
            .invoice-title { 
              display: inline-block;
              font-size: 16px; 
              font-weight: 600; 
              margin: 20px 0 0 0;
              padding: 6px 16px;
              background: #dbeafe;
              color: #1e40af;
              border-radius: 4px;
            }
            .content {
              padding: 30px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            .info-section { 
              background: #f9fafb;
              padding: 20px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .info-section h3 { 
              font-size: 12px; 
              font-weight: 600; 
              margin: 0 0 12px 0; 
              text-transform: uppercase;
              color: #6b7280;
              letter-spacing: 0.05em;
            }
            .info-section p { 
              margin: 6px 0; 
              font-size: 14px;
              color: #374151;
            }
            .info-section p strong {
              color: #111827;
              font-weight: 600;
            }
            .items-container {
              margin-bottom: 30px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .items-table th { 
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #6b7280;
              border-bottom: 1px solid #e5e7eb;
            }
            .items-table td { 
              padding: 16px 12px; 
              border-bottom: 1px solid #f3f4f6;
              color: #374151;
              font-size: 14px;
            }
            .items-table tr:last-child td {
              border-bottom: none;
            }
            .item-name {
              font-weight: 600;
              color: #111827;
              margin-bottom: 2px;
            }
            .item-details {
              font-size: 13px;
              color: #6b7280;
            }
            .totals { 
              width: 350px; 
              margin-left: auto; 
              background: #f9fafb;
              padding: 20px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .totals table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .totals td { 
              padding: 8px 0;
              font-size: 14px;
              color: #374151;
            }
            .totals td:last-child {
              text-align: right;
              font-weight: 600;
              color: #111827;
            }
            .totals .subtotal-row {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 12px;
              margin-bottom: 8px;
            }
            .totals .tax-row {
              color: #6b7280;
              font-size: 13px;
            }
            .totals .total-row { 
              font-size: 18px;
              font-weight: 700;
              color: #111827;
              border-top: 2px solid #e5e7eb;
              padding-top: 12px;
              margin-top: 8px;
            }
            .totals .total-row td:last-child {
              color: #2563eb;
            }
            .payment-section {
              background: #eff6ff;
              padding: 20px;
              border-radius: 6px;
              margin-top: 30px;
              border: 1px solid #dbeafe;
            }
            .payment-header {
              font-size: 14px;
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .payment-details {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .payment-method {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              color: #374151;
            }
            .payment-method-badge {
              background: #2563eb;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .payment-status {
              display: flex;
              align-items: center;
              gap: 6px;
              color: #059669;
              font-size: 14px;
              font-weight: 600;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 13px;
            }
            .footer-message {
              font-size: 14px;
              color: #374151;
              margin-bottom: 8px;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                background: white;
              }
              .invoice-container {
                border: none;
                border-radius: 0;
              }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const printThermalReceipt = () => {
    const printContents = thermalPrintRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoice.orderNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 10px; 
              color: #000;
              background: white;
              font-size: 12px;
              line-height: 1.4;
            }
            .thermal-receipt { 
              width: 300px; 
              margin: 0 auto; 
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .separator { 
              border-top: 1px dashed #000; 
              margin: 10px 0; 
            }
            .item-line { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0; 
            }
            .total-section {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #000;
            }
            .total-line { 
              font-weight: bold; 
              font-size: 14px;
              margin-top: 5px;
            }
            @media print {
              body { margin: 0; padding: 5px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const downloadPDF = () => {
    // This would integrate with a PDF library like jsPDF
    // For now, just print as PDF
    window.print();
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header Controls */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invoice Preview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order #{invoice.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={downloadPDF}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Standard Invoice Format */}
          <div ref={printRef} className="invoice-container">
            {/* Header */}
            <div className="header">
              <div className="company-name">{invoice.restaurant.name}</div>
              <div className="company-details">
                <div>{invoice.restaurant.address}</div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {invoice.restaurant.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {invoice.restaurant.email}
                  </span>
                </div>
                {invoice.restaurant.gst && (
                  <div className="mt-2">
                    <span className="font-semibold">GST:</span> {invoice.restaurant.gst}
                  </div>
                )}
              </div>
              <div className="invoice-title">TAX INVOICE</div>
            </div>

            <div className="content">
              {/* Invoice Info Grid */}
              <div className="info-grid">
                <div className="info-section">
                  <h3>Invoice Details</h3>
                  <p><strong>Invoice Number:</strong> {invoice.orderNumber}</p>
                  <p><strong>Date:</strong> {invoice.date}</p>
                  <p><strong>Time:</strong> {invoice.time}</p>
                  <p><strong>Order Type:</strong> {invoice.order.type.replace('_', ' ').toUpperCase()}</p>
                  {invoice.order.tableNumber && (
                    <p><strong>Table Number:</strong> {invoice.order.tableNumber}</p>
                  )}
                  {invoice.order.waiterName && (
                    <p><strong>Served by:</strong> {invoice.order.waiterName}</p>
                  )}
                </div>

                <div className="info-section">
                  <h3>Bill To</h3>
                  <p><strong>{invoice.customer.name}</strong></p>
                  {invoice.customer.phone && (
                    <p><Phone className="w-3 h-3 inline mr-1" />{invoice.customer.phone}</p>
                  )}
                  {invoice.customer.email && (
                    <p><Mail className="w-3 h-3 inline mr-1" />{invoice.customer.email}</p>
                  )}
                  {invoice.customer.address && (
                    <p><MapPin className="w-3 h-3 inline mr-1" />{invoice.customer.address}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="items-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>Item Details</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '17.5%', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ width: '17.5%', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="item-name">{item.name}</div>
                          {item.category && (
                            <div className="item-details">{item.category}</div>
                          )}
                          {item.notes && (
                            <div className="item-details" style={{ fontStyle: 'italic' }}>
                              Note: {item.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="totals">
                <table>
                  <tr className="subtotal-row">
                    <td>Subtotal</td>
                    <td>₹{invoice.totals.subtotal.toFixed(2)}</td>
                  </tr>
                  {invoice.totals.discount && invoice.totals.discount > 0 && (
                    <tr className="tax-row">
                      <td>Discount</td>
                      <td>-₹{invoice.totals.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  {invoice.totals.serviceCharge && invoice.totals.serviceCharge > 0 && (
                    <tr className="tax-row">
                      <td>Service Charge</td>
                      <td>₹{invoice.totals.serviceCharge.toFixed(2)}</td>
                    </tr>
                  )}
                  {invoice.totals.gstBreakdown ? (
                    <>
                      {invoice.totals.gstBreakdown.cgst && (
                        <tr className="tax-row">
                          <td>CGST ({(invoice.totals.gstBreakdown.rate * 50).toFixed(1)}%)</td>
                          <td>₹{invoice.totals.gstBreakdown.cgst.toFixed(2)}</td>
                        </tr>
                      )}
                      {invoice.totals.gstBreakdown.sgst && (
                        <tr className="tax-row">
                          <td>SGST ({(invoice.totals.gstBreakdown.rate * 50).toFixed(1)}%)</td>
                          <td>₹{invoice.totals.gstBreakdown.sgst.toFixed(2)}</td>
                        </tr>
                      )}
                      {invoice.totals.gstBreakdown.igst && (
                        <tr className="tax-row">
                          <td>IGST ({(invoice.totals.gstBreakdown.rate * 100).toFixed(0)}%)</td>
                          <td>₹{invoice.totals.gstBreakdown.igst.toFixed(2)}</td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr className="tax-row">
                      <td>GST (5%)</td>
                      <td>₹{invoice.totals.tax.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="total-row">
                    <td>Total Amount</td>
                    <td>₹{invoice.totals.total.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              {/* Payment Info */}
              <div className="payment-section">
                <h3 className="payment-header">Payment Information</h3>
                <div className="payment-details">
                  <div className="payment-method">
                    <span>Payment Method:</span>
                    <span className="payment-method-badge">
                      {invoice.payment.method.toUpperCase()}
                    </span>
                  </div>
                  <div className="payment-status">
                    <CheckCircle className="w-5 h-5" />
                    <span>Payment Received</span>
                  </div>
                </div>
                {invoice.payment.reference && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                    Reference: {invoice.payment.reference}
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              {invoice.order.specialInstructions && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '12px 16px', 
                  background: '#fef3c7', 
                  borderRadius: '6px',
                  border: '1px solid #fde68a'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: '#92400e',
                    fontWeight: 600 
                  }}>
                    Special Instructions:
                  </p>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '13px', 
                    color: '#78350f' 
                  }}>
                    {invoice.order.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="footer">
              {invoice.footer?.message && (
                <div className="footer-message">{invoice.footer.message}</div>
              )}
              {invoice.footer?.returnPolicy && (
                <div style={{ marginBottom: '8px' }}>{invoice.footer.returnPolicy}</div>
              )}
              {invoice.footer?.website && (
                <div>{invoice.footer.website}</div>
              )}
              <div style={{ marginTop: '16px', fontSize: '12px' }}>
                This is a computer generated invoice
              </div>
            </div>
          </div>

          {/* Thermal Receipt Format (Hidden) */}
          <div ref={thermalPrintRef} style={{ display: 'none' }}>
            <div className="thermal-receipt">
              <div className="center bold" style={{ fontSize: '16px', marginBottom: '10px' }}>
                {invoice.restaurant.name}
              </div>
              <div className="center" style={{ fontSize: '11px', marginBottom: '5px' }}>
                {invoice.restaurant.address}
              </div>
              <div className="center" style={{ fontSize: '11px', marginBottom: '10px' }}>
                {invoice.restaurant.phone}
              </div>
              {invoice.restaurant.gst && (
                <div className="center" style={{ fontSize: '11px', marginBottom: '10px' }}>
                  GST: {invoice.restaurant.gst}
                </div>
              )}
              
              <div className="separator"></div>
              
              <div className="center bold" style={{ marginBottom: '10px' }}>
                TAX INVOICE
              </div>
              
              <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                <div>Invoice: {invoice.orderNumber}</div>
                <div>Date: {invoice.date} {invoice.time}</div>
                <div>Customer: {invoice.customer.name}</div>
                {invoice.order.tableNumber && <div>Table: {invoice.order.tableNumber}</div>}
                {invoice.order.waiterName && <div>Waiter: {invoice.order.waiterName}</div>}
              </div>
              
              <div className="separator"></div>
              
              {/* Items */}
              <div style={{ marginBottom: '10px' }}>
                {invoice.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    <div>{item.name}</div>
                    <div className="item-line">
                      <span>{item.quantity} x ₹{item.unitPrice.toFixed(2)}</span>
                      <span>₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="separator"></div>
              
              {/* Totals */}
              <div className="total-section">
                <div className="item-line">
                  <span>Subtotal:</span>
                  <span>₹{invoice.totals.subtotal.toFixed(2)}</span>
                </div>
                {invoice.totals.gstBreakdown && (
                  <>
                    {invoice.totals.gstBreakdown.cgst && (
                      <div className="item-line">
                        <span>CGST (2.5%):</span>
                        <span>₹{invoice.totals.gstBreakdown.cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.totals.gstBreakdown.sgst && (
                      <div className="item-line">
                        <span>SGST (2.5%):</span>
                        <span>₹{invoice.totals.gstBreakdown.sgst.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="item-line total-line">
                  <span>TOTAL:</span>
                  <span>₹{invoice.totals.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="separator"></div>
              
              <div className="center" style={{ marginTop: '10px', fontSize: '11px' }}>
                {invoice.payment.method.toUpperCase()} - PAID
              </div>
              
              {invoice.footer?.message && (
                <div className="center bold" style={{ marginTop: '15px', fontSize: '12px' }}>
                  {invoice.footer.message}
                </div>
              )}
              
              <div className="center" style={{ marginTop: '15px', fontSize: '10px' }}>
                {new Date().toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}