/* eslint-disable @next/next/no-img-element */
export default function Og() {
  return (
    <div className="og">
      <div className="og-text">
        <img src="/wordmark-nav.png" alt="" />
        <p className="og-kicker">Black Friday offer, until 30 November</p>
        <p className="og-price">$0.99</p>
        <p className="og-for">
          for your first month of <em>Anthemius Studio</em>
        </p>
        <p className="og-also">€0,99 in Europe · ₹99 in India</p>
      </div>
      <div className="og-img">
        <img src="/img/living.jpg" alt="" />
      </div>
    </div>
  );
}
