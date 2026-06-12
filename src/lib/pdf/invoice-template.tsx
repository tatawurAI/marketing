// Server-side only — do NOT add 'use client'
import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import fs from 'fs';
import path from 'path';
import type { InvoiceData } from './types';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
  },
  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logo: {
    width: 140,
    height: 'auto',
  },
  headerRight: {
    alignItems: 'flex-end',
    flex: 1,
    paddingLeft: 16,
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#0B0E0F',
    marginBottom: 3,
  },
  headerDateRange: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#008F7A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
  },
  headerRule: {
    borderTopWidth: 1.5,
    borderTopColor: '#008F7A',
    marginBottom: 20,
  },
  // ── Table ───────────────────────────────────────────────────────────────
  tableContainer: {
    marginTop: 0,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#008F7A',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: '#F5F0E8',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F5F5F5',
  },
  colDate: {
    width: 90,
  },
  colHours: {
    width: 55,
    textAlign: 'right',
  },
  colDescription: {
    flex: 1,
    paddingLeft: 8,
  },
  // ── Summary ─────────────────────────────────────────────────────────────
  summaryContainer: {
    marginTop: 28,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    minWidth: 320,
    marginBottom: 5,
  },
  summaryLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 16,
    color: '#555555',
    fontSize: 10,
  },
  summaryValue: {
    width: 110,
    textAlign: 'right',
    color: '#0B0E0F',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  summaryDivider: {
    borderTopWidth: 0.5,
    borderTopColor: '#008F7A',
    marginTop: 7,
    marginBottom: 10,
    width: 320,
  },
  summaryTotalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 16,
    color: '#B8935A',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  summaryTotalValue: {
    width: 110,
    textAlign: 'right',
    color: '#B8935A',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    fontSize: 8,
    color: '#555555',
  },
  footerRight: {
    fontSize: 8,
    color: '#AAAAAA',
  },
});

function getPeriodLabel(startDate: string, endDate: string): string {
  return `${format(parseISO(startDate), 'MM/dd/yyyy')} – ${format(
    parseISO(endDate),
    'MM/dd/yyyy',
  )}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface InvoiceDocumentProps {
  data: InvoiceData;
}

export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  let logoDataUri: string | undefined;
  try {
    const logoBuffer = fs.readFileSync(
      path.join(
        process.cwd(),
        'public',
        'brand',
        'tatawur-lockup-horizontal@4096.png',
      ),
    );
    logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {
    // logo file unavailable — render invoice without it
  }

  const totalHours = data.entries.reduce((sum, e) => sum + e.hours, 0);
  const totalAmount =
    data.billingRate !== null ? totalHours * data.billingRate : null;

  const periodLabel = getPeriodLabel(data.startDate, data.endDate);
  const invoiceDateLabel = format(parseISO(data.generatedAt), 'MMMM d, yyyy');

  return (
    <Document title={`Tatawur Invoice — ${data.employeeName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoDataUri && <Image style={styles.logo} src={logoDataUri} />}
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>
              Tatawur Professional Services
            </Text>
            <Text style={styles.headerDateRange}>
              Dates Covered: {periodLabel}
            </Text>
            <Text style={styles.headerSubtitle}>
              Invoice Date: {invoiceDateLabel}
            </Text>
            <Text style={styles.headerSubtitle}>
              {data.employeeName} · {data.projectName}
            </Text>
          </View>
        </View>

        {/* Emerald rule separating header from table */}
        <View style={styles.headerRule} />

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* Header row */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colHours]}>
              Hours
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>
              Description
            </Text>
          </View>

          {/* Data rows */}
          {data.entries.map((entry, index) => (
            <View
              key={`${entry.work_date}-${index}`}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowOdd : styles.tableRowEven,
              ]}
            >
              <Text style={styles.colDate}>
                {format(parseISO(entry.work_date), 'MMM d, yyyy')}
              </Text>
              <Text style={styles.colHours}>{entry.hours.toFixed(1)}</Text>
              <Text style={styles.colDescription}>{entry.notes ?? ''}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Hours:</Text>
            <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hourly Rate:</Text>
            <Text style={styles.summaryValue}>
              {data.billingRate !== null
                ? formatCurrency(data.billingRate)
                : 'Rate not set'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount Due:</Text>
            <Text style={styles.summaryTotalValue}>
              {totalAmount !== null ? formatCurrency(totalAmount) : '—'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            Please remit to tarek@tatawur.ai
          </Text>
          <Text style={styles.footerRight}>tatawur.ai</Text>
        </View>
      </Page>
    </Document>
  );
}
