// Newsletter send helpers. Pure and injectable so the send path is testable
// without Firestore or Resend. Nothing here sends anything by itself.

export interface BatchMailer {
  batch: {
    send(payload: unknown[]): Promise<{ data?: unknown; error?: { message?: string } | null }>
  }
}

/** Footer every marketing send must carry: working opt-out + postal address. */
export function buildFooter(unsubscribeUrl: string, postalAddress: string): string {
  return `<hr style="margin-top:32px;border:none;border-top:1px solid #e5e0d8" />
<p style="font-size:12px;line-height:1.6;color:#78716c">
You are getting this because you subscribed at kirankumarg.me.
<a href="${unsubscribeUrl}">Unsubscribe</a> anytime.<br/>
${postalAddress}
</p>`
}

/** Per-recipient HTML: body plus their personal unsubscribe link. */
export function personalize(html: string, token: string, siteUrl: string, postalAddress: string): string {
  const url = `${siteUrl}/unsubscribe?token=${encodeURIComponent(token)}`
  return html + buildFooter(url, postalAddress)
}

export interface SendBatchesResult {
  sent: number
  failed: number
  error?: string
}

/**
 * Send prepared payloads in batches, CHECKING each batch result. A failed
 * batch is reported with accurate counts - never counted as sent.
 */
export async function sendBatches(
  mailer: BatchMailer,
  payloads: unknown[][],
  onProgress?: (sent: number) => void
): Promise<SendBatchesResult> {
  let sent = 0
  for (const payload of payloads) {
    const { error } = await mailer.batch.send(payload)
    if (error) {
      const failed = payloads.slice(payloads.indexOf(payload)).reduce((n, p) => n + p.length, 0)
      return { sent, failed, error: error.message || 'Resend rejected the batch.' }
    }
    sent += payload.length
    onProgress?.(sent)
  }
  return { sent, failed: 0 }
}
