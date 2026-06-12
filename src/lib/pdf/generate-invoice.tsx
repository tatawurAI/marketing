import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument } from './invoice-template'
import type { InvoiceData } from './types'

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />)
}
