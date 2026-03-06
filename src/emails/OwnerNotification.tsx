type OrderItem = { id: string; qty: number; name?: string; subItems?: { name: string; qty: number }[] };

type Props = {
  customerName: string;
  customerEmail: string;
  batchSize: number;
  items: OrderItem[];
  notes?: string;
  totalCents: number;
  shippingAddress?: string;
  isGift?: boolean;
  giftMessage?: string;
};

function eur(cents: number) {
  return `&euro;${(cents / 100).toFixed(2)}`;
}

export function renderOwnerNotification(props: Props): string {
  const { customerName, customerEmail, batchSize, items, notes, totalCents, shippingAddress, isGift, giftMessage } = props;

  const rows = items
    .map(
      (item, i) => {
        const subRows = item.subItems
          ? item.subItems.map((sub) => `
      <tr>
        <td style="padding:4px 16px 4px 28px;font-size:12px;color:#3D231480">${sub.name}</td>
        <td style="padding:4px 16px;font-size:12px;text-align:right;color:#3D231480">&times; ${sub.qty}</td>
      </tr>`).join("")
          : "";
        return `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#FAF6F1"}">
        <td style="padding:12px 16px;font-size:14px;color:#3D2314">${item.name ?? item.id}</td>
        <td style="padding:12px 16px;font-size:14px;text-align:right;font-weight:600;color:#3D2314">&times; ${item.qty}</td>
      </tr>${subRows}`;
      }
    )
    .join("");

  const addressRow = shippingAddress
    ? `<tr>
        <td style="padding:4px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A;width:100px">Address</td>
        <td style="padding:4px 0;font-size:14px;color:#3D2314">${shippingAddress}</td>
      </tr>`
    : "";

  const notesBlock = notes
    ? `<p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A">Notes</p>
       <p style="margin:0 0 32px;font-size:14px;line-height:1.6;color:#3D2314;background:#FAF6F1;border-radius:8px;padding:16px">${notes}</p>`
    : "";

  const giftRow = isGift
    ? `<tr>
        <td style="padding:4px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A;width:100px">Gift</td>
        <td style="padding:4px 0;font-size:14px;color:#3D2314">Yes${giftMessage ? ` &mdash; &ldquo;${giftMessage}&rdquo;` : ""}</td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF6F1;color:#3D2314;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(61,35,20,0.08)">
        <tr>
          <td style="background:#C1813A;padding:32px 40px;text-align:center">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ffffff">New Order Received</p>
            <p style="margin:6px 0 0;font-size:13px;color:#FAF6F1CC;letter-spacing:1px">Box of ${batchSize} cookies &middot; ${eur(totalCents)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;border-radius:12px;padding:20px;margin-bottom:32px">
              <tr>
                <td style="padding:4px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A;width:100px">Name</td>
                <td style="padding:4px 0;font-size:14px;color:#3D2314">${customerName}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A">Email</td>
                <td style="padding:4px 0;font-size:14px;color:#3D2314">
                  <a href="mailto:${customerEmail}" style="color:#C1813A">${customerEmail}</a>
                </td>
              </tr>
              ${addressRow}
              ${giftRow}
            </table>

            <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#C1813A">Cookie Breakdown</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8D9C4;border-radius:12px;overflow:hidden;margin-bottom:32px">
              <tbody>${rows}</tbody>
            </table>

            ${notesBlock}
          </td>
        </tr>
        <tr>
          <td style="background:#FAF6F1;padding:24px 40px;text-align:center;font-size:12px;color:#3D231480">
            Ele&#x27;s Cookies &middot; Order notification
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
