/**
 * Invoice Print Component
 * Professional invoice printing with thermal and standard printer support
 */

"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
  Info
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

export default function InvoicePrint({ 
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
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #000;
              background: white;
            }
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .invoice-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 30px; 
            }
            .info-section h3 { 
              font-size: 14px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              text-transform: uppercase;
            }
            .info-section p { 
              margin: 5px 0; 
              font-size: 12px; 
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .items-table th, .items-table td { 
              padding: 8px; 
              text-align: left; 
              border-bottom: 1px solid #ddd; 
            }
            .items-table th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .totals { 
              width: 300px; 
              margin-left: auto; 
              margin-bottom: 30px; 
            }
            .totals table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .totals td { 
              padding: 5px 10px; 
              border-bottom: 1px solid #eee; 
            }
            .totals .total-line { 
              font-weight: bold; 
              border-top: 2px solid #000; 
              border-bottom: 2px solid #000; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              font-size: 12px; 
            }
            .payment-info { 
              background-color: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              margin-bottom: 20px; 
            }
            @media print {
              body { margin: 0; padding: 0; }
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
              line-height: 1.2;
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
              margin: 2px 0; 
            }
            .total-line { 
              font-weight: bold; 
              border-top: 1px solid #000; 
              padding-top: 5px; 
              margin-top: 10px; 
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header Controls */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Invoice Preview</h2>
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
              PDF
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Standard Invoice Format */}
          <div ref={printRef} className="invoice-container">
            {/* Header */}
            <div className="header">
              <div className="company-name">{invoice.restaurant.name}</div>
              <div className="text-sm text-gray-600">
                <div>{invoice.restaurant.address}</div>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {invoice.restaurant.phone}
                  </span>
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {invoice.restaurant.email}
                  </span>
                </div>
                {invoice.restaurant.gst && (
                  <div className="mt-1">GST: {invoice.restaurant.gst}</div>
                )}
              </div>
              <div className="invoice-title">INVOICE</div>
            </div>

            {/* Invoice Info Grid */}
            <div className="info-grid">
              <div className="info-section">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> {invoice.orderNumber}</p>
                <p><strong>Date:</strong> {invoice.date}</p>
                <p><strong>Time:</strong> {invoice.time}</p>
                <p><strong>Order Type:</strong> {invoice.order.type.replace('_', ' ').toUpperCase()}</p>
                {invoice.order.tableNumber && (
                  <p><strong>Table:</strong> {invoice.order.tableNumber}</p>
                )}
                {invoice.order.waiterName && (
                  <p><strong>Served by:</strong> {invoice.order.waiterName}</p>
                )}
              </div>

              <div className="info-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {invoice.customer.name}</p>
                {invoice.customer.phone && (
                  <p><strong>Phone:</strong> {invoice.customer.phone}</p>
                )}
                {invoice.customer.email && (
                  <p><strong>Email:</strong> {invoice.customer.email}</p>
                )}
                {invoice.customer.address && (
                  <p><strong>Address:</strong> {invoice.customer.address}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="font-medium">{item.name}</div>
                      {item.category && (
                        <div className="text-sm text-gray-500">{item.category}</div>
                      )}
                      {item.notes && (
                        <div className="text-sm text-gray-500 italic">{item.notes}</div>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice.toFixed(2)}</td>
                    <td>₹{item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td className="text-right">₹{invoice.totals.subtotal.toFixed(2)}</td>
                </tr>
                {invoice.totals.discount && (
                  <tr>
                    <td>Discount:</td>
                    <td className="text-right">-₹{invoice.totals.discount.toFixed(2)}</td>
                  </tr>
                )}
                {invoice.totals.serviceCharge && (
                  <tr>
                    <td>Service Charge:</td>
                    <td className="text-right">₹{invoice.totals.serviceCharge.toFixed(2)}</td>
                  </tr>
                )}
                {invoice.totals.gstBreakdown ? (
                  <>
                    {invoice.totals.gstBreakdown.cgst && (
                      <tr>
                        <td>CGST (2.5%):</td>
                        <td className="text-right">₹{invoice.totals.gstBreakdown.cgst.toFixed(2)}</td>
                      </tr>
                    )}
                    {invoice.totals.gstBreakdown.sgst && (
                      <tr>
                        <td>SGST (2.5%):</td>
                        <td className="text-right">₹{invoice.totals.gstBreakdown.sgst.toFixed(2)}</td>
                      </tr>
                    )}
                    {invoice.totals.gstBreakdown.igst && (
                      <tr>
                        <td>IGST (5%):</td>
                        <td className="text-right">₹{invoice.totals.gstBreakdown.igst.toFixed(2)}</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td>GST (5%):</td>
                    <td className="text-right">₹{invoice.totals.tax.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="total-line">
                  <td>Total:</td>
                  <td className="text-right">₹{invoice.totals.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            {/* Payment Info */}
            <div className="payment-info">
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">{invoice.payment.method.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-medium">₹{invoice.payment.amount.toFixed(2)}</span>
              </div>
              {invoice.payment.reference && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium">{invoice.payment.reference}</span>
                </div>
              )}
              {invoice.payment.change && invoice.payment.change > 0 && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-medium">₹{invoice.payment.change.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            {invoice.order.specialInstructions && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <p className="text-sm text-gray-600">{invoice.order.specialInstructions}</p>
              </div>
            )}

            {/* GST Information */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">GST Information</div>
                  <div className="mt-1">
                    • Restaurant services are subject to 5% GST as per Indian tax law
                    {invoice.totals.gstBreakdown?.cgst && invoice.totals.gstBreakdown?.sgst ? (
                      <div>• Intra-state supply: CGST (2.5%) + SGST (2.5%) = 5%</div>
                    ) : (
                      <div>• Inter-state supply: IGST (5%)</div>
                    )}
                    <div>• GST Registration: {invoice.restaurant.gst || 'Not provided'}</div>
                    <div>• HSN Code: 996331 (Restaurant services)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              {invoice.footer?.message && (
                <p className="mb-2">{invoice.footer.message}</p>
              )}
              {invoice.footer?.returnPolicy && (
                <p className="text-xs text-gray-500 mb-2">{invoice.footer.returnPolicy}</p>
              )}
              {invoice.footer?.website && (
                <p className="text-xs">Visit us at: {invoice.footer.website}</p>
              )}
              <p className="text-xs mt-4">Thank you for your business!</p>
            </div>
          </div>

          {/* Thermal Receipt Format (Hidden, for printing only) */}
          <div ref={thermalPrintRef} className="thermal-receipt hidden">
            <div className="center bold">{invoice.restaurant.name}</div>
            <div className="center">{invoice.restaurant.address}</div>
            <div className="center">{invoice.restaurant.phone}</div>
            {invoice.restaurant.gst && (
              <div className="center">GST: {invoice.restaurant.gst}</div>
            )}
            
            <div className="separator"></div>
            
            <div className="bold">RECEIPT</div>
            <div>Invoice #: {invoice.orderNumber}</div>
            <div>Date: {invoice.date} {invoice.time}</div>
            <div>Customer: {invoice.customer.name}</div>
            {invoice.order.tableNumber && (
              <div>Table: {invoice.order.tableNumber}</div>
            )}
            {invoice.order.waiterName && (
              <div>Served by: {invoice.order.waiterName}</div>
            )}
            
            <div className="separator"></div>
            
            {invoice.items.map((item, index) => (
              <div key={index}>
                <div className="item-line">
                  <span>{item.name}</span>
                </div>
                <div className="item-line">
                  <span>{item.quantity} x ₹{item.unitPrice.toFixed(2)}</span>
                  <span>₹{item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
            
            <div className="separator"></div>
            
            <div className="item-line">
              <span>Subtotal:</span>
              <span>₹{invoice.totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="item-line">
              <span>GST (5%):</span>
              <span>₹{invoice.totals.tax.toFixed(2)}</span>
            </div>
            <div className="item-line total-line">
              <span>TOTAL:</span>
              <span>₹{invoice.totals.total.toFixed(2)}</span>
            </div>
            
            <div className="separator"></div>
            
            <div>Payment: {invoice.payment.method.toUpperCase()}</div>
            <div>Amount: ₹{invoice.payment.amount.toFixed(2)}</div>
            {invoice.payment.change && invoice.payment.change > 0 && (
              <div>Change: ₹{invoice.payment.change.toFixed(2)}</div>
            )}
            
            <div className="separator"></div>
            
            <div className="center">Thank you for your business!</div>
            {invoice.footer?.website && (
              <div className="center">{invoice.footer.website}</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}