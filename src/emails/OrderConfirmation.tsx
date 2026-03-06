type OrderItem = { id: string; qty: number; name?: string };

type Props = {
  customerName: string;
  batchSize: number;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  trackingUrl: string;
  isGift?: boolean;
  giftMessage?: string;
};

function eur(cents: number) {
  return `&euro;${(cents / 100).toFixed(2)}`;
}

export function renderOrderConfirmation(props: Props): string {
  const { customerName, batchSize, items, subtotalCents, shippingCents, totalCents, trackingUrl, isGift, giftMessage } = props;

  const rows = items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#FAF6F1"}">
        <td style="padding:12px 16px;font-size:14px;color:#3D2314">${item.name ?? item.id}</td>
        <td style="padding:12px 16px;font-size:14px;text-align:right;color:#3D2314">${item.qty}</td>
      </tr>`
    )
    .join("");

  const shippingLine =
    shippingCents === 0 ? "Free" : eur(shippingCents);

  return `<!DOCTYPE html>
<html>
<body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF6F1;color:#3D2314;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(61,35,20,0.08)">
        <tr>
          <td style="background:#3D2314;padding:32px 40px;text-align:center">
            <p style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#FAF6F1;letter-spacing:-0.5px">Ele&#x27;s Cookies</p>
            <p style="margin:8px 0 0;font-size:13px;color:#E8D9C4;letter-spacing:2px;text-transform:uppercase">Order Confirmed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <p style="margin:0 0 16px;font-size:16px">Hi ${customerName},</p>
            <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#3D2314CC">
              Your box of <strong>${batchSize} cookies</strong> is confirmed!
              We&#x27;re baking them fresh and will have them ready for delivery soon.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8D9C4;border-radius:12px;overflow:hidden;margin-bottom:32px">
              <thead>
                <tr style="background:#FAF6F1">
                  <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A">Flavour</th>
                  <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A">Qty</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#3D2314CC">Subtotal</td>
                <td style="padding:6px 0;font-size:14px;text-align:right;color:#3D2314">${eur(subtotalCents)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#3D2314CC">Delivery</td>
                <td style="padding:6px 0;font-size:14px;text-align:right;color:#3D2314">${shippingLine}</td>
              </tr>
              <tr>
                <td style="padding:12px 0 6px;font-size:16px;font-weight:bold;border-top:1px solid #E8D9C4;color:#3D2314">Total</td>
                <td style="padding:12px 0 6px;font-size:16px;font-weight:bold;text-align:right;border-top:1px solid #E8D9C4;color:#C1813A">${eur(totalCents)}</td>
              </tr>
            </table>

            ${isGift ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;border-radius:12px;padding:20px;margin-bottom:32px">
              <tr>
                <td style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A;padding-bottom:8px">Gift order</td>
              </tr>
              ${giftMessage ? `<tr><td style="font-size:14px;line-height:1.6;color:#3D2314;font-style:italic">&ldquo;${giftMessage}&rdquo;</td></tr>` : ""}
            </table>` : ""}

            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3D2314CC">
              We&#x27;ll be in touch shortly to arrange delivery. Questions? Reply to this email anytime.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
              <tr>
                <td align="center">
                  <a href="${trackingUrl}" style="display:inline-block;background:#C1813A;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:999px">
                    Track your order
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:15px;color:#3D2314">With love,<br><strong>Ele</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAF6F1;padding:24px 40px;text-align:center;font-size:12px;color:#3D231480">
            Ele&#x27;s Cookies &middot; Limassol, Cyprus
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
