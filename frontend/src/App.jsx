import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, BedDouble, Building2,
  CalendarDays, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3,
  Filter, HeartHandshake, House, KeyRound, LogOut, MapPin, Menu, MessageCircle,
  Plus, Search, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles,
  Users, X, Zap,
} from "lucide-react";
import {
  Link, NavLink, Navigate, Outlet, Route, Routes, useLocation,
  useNavigate, useParams, useSearchParams,
} from "react-router-dom";
import api from "./api";
import { useAuth } from "./context/AuthContext";

const money = (amount) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 0,
}).format(Number(amount || 0));

const listFrom = (data) => Array.isArray(data) ? data : (data?.results || []);
const roles = [
  { value: "seeker", label: "Looking for a home" },
  { value: "landlord", label: "Landlord" },
  { value: "agent", label: "Property agent" },
  { value: "hostel_operator", label: "Hostel operator" },
];
const typeLabels = {
  room: "Room in shared apartment", private: "Private room",
  shared: "Shared apartment", flat: "Entire apartment", house: "House",
  commercial: "Commercial space", hostel: "Student hostel",
};

function PageLoading() {
  return <div className="hm-loading"><span className="hm-logo-mark">h.</span><span>Making room for you…</span></div>;
}

function SiteLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const closeMenu = () => setMobileOpen(false);
  const signOut = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    closeMenu();
  };

  useEffect(() => { closeMenu(); }, [location.pathname]);

  return (
    <>
      <header className="hm-header">
        <div className="hm-header-inner">
          <Link to="/" className="hm-brand">
            <span className="hm-logo-mark"><House size={18} /></span>
            <span>housemates<span className="hm-brand-dot">.</span><small>UNITING LIKE MINDS</small></span>
          </Link>
          <button className="hm-mobile-menu" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={"hm-nav " + (mobileOpen ? "is-open" : "")}>
            <NavLink to="/homes">Find home</NavLink>
            <NavLink to="/housemates">Find housemates</NavLink>
            <NavLink to="/hostels">Hostels</NavLink>
            {user && <><NavLink to="/enquiries">Enquiries</NavLink><NavLink to="/viewings">Viewings</NavLink><NavLink to="/introductions">Introductions</NavLink></>}
            {user ? (
              <div className="hm-nav-account">
                {["landlord", "agent", "provider", "hostel", "hostel_operator", "staff"].includes(user.role) && (
                  <Link to="/provider" className="hm-button hm-button-dark hm-button-sm"><Plus size={15} /> Add listing</Link>
                )}
                <Link to="/profile" className="hm-user-chip">
                  <span>{(user.display_name || user.username || "H").slice(0, 1).toUpperCase()}</span>
                  {user.display_name || user.username}
                </Link>
                <button className="hm-icon-button" onClick={signOut} disabled={loggingOut} aria-label="Sign out"><LogOut size={17} /></button>
              </div>
            ) : (
              <div className="hm-nav-account">
                <Link to="/sign-in" className="hm-nav-login">Log in</Link>
                <Link to="/join" className="hm-button hm-button-dark hm-button-sm">Get started <ArrowUpRight size={15} /></Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="hm-footer">
        <div className="hm-footer-inner">
          <Link to="/" className="hm-brand hm-brand-light"><span className="hm-logo-mark"><House size={18} /></span><span>housemates<span className="hm-brand-dot">.</span><small>UNITING LIKE MINDS</small></span></Link>
          <p>Find a place. Find your people. Move in with confidence.</p>
          <span>Housemates Technologies LTD · Nigeria</span>
        </div>
      </footer>
    </>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoading />;
  if (!user) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  return children;
}

function Eyebrow({ children, light = false }) {
  return <div className={"hm-eyebrow " + (light ? "hm-eyebrow-light" : "")}><i />{children}</div>;
}

function ListingCard({ listing }) {
  const photo = listing.photos?.[0]?.image;
  return (
    <article className="hm-listing-card">
      <Link to={"/homes/" + listing.id} className="hm-listing-image">
        {photo ? <img src={photo} alt={listing.title} loading="lazy" /> : <div className="hm-listing-placeholder"><House size={32} /><span>Find your next chapter</span></div>}
        <span className="hm-listing-tag">{typeLabels[listing.listing_type] || "Accommodation"}</span>
        <span className="hm-image-arrow"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="hm-listing-body">
        <span className="hm-card-location"><MapPin size={13} /> {listing.area}, {listing.city}</span>
        <Link to={"/homes/" + listing.id} className="hm-listing-title">{listing.title}</Link>
        <div className="hm-listing-stats"><span><BedDouble size={14} /> {listing.bedrooms} {listing.bedrooms === 1 ? "bedroom" : "bedrooms"}</span>{listing.is_furnished && <span>Furnished</span>}{listing.verification_checks?.some((check) => check.status === "checked") && <span className="hm-checked"><BadgeCheck size={13} /> Checks recorded</span>}</div>
        <div className="hm-listing-price"><div><strong>{money(listing.rent)}</strong><span> / {listing.rent_period || "yearly"}</span></div><small>Move-in estimate <b>{money(listing.move_in_total)}</b></small></div>
      </div>
    </article>
  );
}

function EmptyState({ icon: Icon = CircleHelp, title, children, action }) {
  return (
    <div className="hm-empty">
      <span className="hm-empty-icon"><Icon size={23} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [city, setCity] = useState("Abuja");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/housing/listings/?city=Abuja")
      .then((data) => setFeatured(listFrom(data).slice(0, 3)))
      .catch((error) => setApiError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (area) params.set("area", area);
    if (budget) params.set("max_price", budget);
    navigate("/homes?" + params.toString());
  };

  return (
    <div className="hm-home">
      <section className="hm-hero">
        <div className="hm-hero-glow" />
        <div className="hm-container hm-hero-content">
          <Eyebrow light>Make your next move count</Eyebrow>
          <h1>Good homes.<br /><em>Better company.</em></h1>
          <p>Find a place that fits your life, and people who make it feel like home. Housing discovery, built around the way we live in Nigeria.</p>
          <form className="hm-hero-search" onSubmit={search}>
            <label><MapPin size={18} /><span><small>City</small><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Abuja" /></span></label>
            <label><span><small>Preferred area</small><input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Any area" /></span></label>
            <label><span><small>Maximum rent (₦)</small><input type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Any budget" /></span></label>
            <button className="hm-button hm-button-clay"><Search size={17} /> Search homes</button>
          </form>
          <div className="hm-hero-note"><ShieldCheck size={15} /> See what was checked, what was not, and what you should ask.</div>
        </div>
        <div className="hm-hero-index"><b>01</b><i /> FIND YOUR NEXT CHAPTER</div>
      </section>

      <section className="hm-proof-strip">
        <div className="hm-container"><span><BadgeCheck size={18} /> Clear listing evidence</span><span><HeartHandshake size={18} /> Compatibility that makes sense</span><span><CheckCircle2 size={18} /> Move-in costs, upfront</span></div>
      </section>

      <section className="hm-section hm-container">
        <div className="hm-section-heading"><div><Eyebrow>A more considered way to live</Eyebrow><h2>Three ways to find<br />where you belong.</h2></div><p>Finding a home is only half the story. The people, the commute and the everyday details matter too.</p></div>
        <div className="hm-pillars">
          <Link to="/homes"><span>01</span><i><House size={21} /></i><h3>Find a home</h3><p>Real places, clear move-in costs and enough detail to know what you are walking into.</p><b>Explore homes <ArrowUpRight size={15} /></b></Link>
          <Link to="/housemates"><span>02</span><i><Users size={21} /></i><h3>Find your people</h3><p>Compare budgets, routines and shared-living expectations before you decide to meet.</p><b>Meet housemates <ArrowUpRight size={15} /></b></Link>
          <Link to="/hostels"><span>03</span><i><Building2 size={21} /></i><h3>Find a hostel</h3><p>Explore student accommodation with campus context, session pricing and bed-space information.</p><b>Browse hostels <ArrowUpRight size={15} /></b></Link>
        </div>
      </section>

      <section className="hm-featured">
        <div className="hm-container">
          <div className="hm-section-heading hm-section-heading-row"><div><Eyebrow>Start with the right space</Eyebrow><h2>Places worth a closer look.</h2></div><Link to="/homes" className="hm-text-link">View all homes <ArrowRight size={16} /></Link></div>
          {loading ? <div className="hm-listing-grid"><div className="hm-skeleton" /><div className="hm-skeleton" /><div className="hm-skeleton" /></div> :
            apiError ? <div className="hm-inline-error">{apiError}</div> :
            featured.length ? <div className="hm-listing-grid">{featured.map((listing) => <ListingCard listing={listing} key={listing.id} />)}</div> :
            <EmptyState icon={House} title="The first good listing starts here.">There are no published Abuja listings yet. Providers can add accommodation and the moderation team can approve it for discovery.</EmptyState>
          }
        </div>
      </section>

      <section className="hm-match-banner hm-container">
        <div><Eyebrow light>Shared living, less guesswork</Eyebrow><h2>Compatibility is more<br />than a percentage.</h2><p>Compare budgets, routines, cleanliness, guests and the little things that make or break a shared home. See where you align and what deserves a conversation.</p><Link to="/housemates" className="hm-button hm-button-paper">Find your housemates <ArrowUpRight size={16} /></Link></div>
        <div className="hm-match-art"><div className="hm-orbit hm-orbit-one" /><div className="hm-orbit hm-orbit-two" /><div className="hm-match-score"><b>86</b><span>compatibility</span><small>Illustrative only</small></div><span className="hm-float hm-float-one">Budget overlap<small>₦150k–₦220k</small></span><span className="hm-float hm-float-two">Shared routine<small>Quiet mornings</small></span><span className="hm-float hm-float-three">Worth discussing<small>Guest habits</small></span></div>
      </section>

      <section className="hm-closing hm-container"><span><House size={25} /></span><div><Eyebrow>A home should feel right</Eyebrow><h2>Make your next move<br />a better one.</h2></div><Link to="/join" className="hm-button hm-button-dark">Get started <ArrowUpRight size={16} /></Link></section>
    </div>
  );
}

function ListingsPage({ hostelOnly = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "Abuja",
    area: searchParams.get("area") || "",
    listing_type: hostelOnly ? "hostel" : (searchParams.get("listing_type") || ""),
    max_price: searchParams.get("max_price") || "",
    min_price: searchParams.get("min_price") || "",
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    api.get("/housing/listings/?" + params.toString())
      .then((data) => setListings(listFrom(data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams, hostelOnly]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const params = {};
    Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
    if (hostelOnly) params.listing_type = "hostel";
    setSearchParams(params);
    setLoading(true);
  };
  const clear = () => {
    const next = { search: "", city: "Abuja", area: "", listing_type: hostelOnly ? "hostel" : "", max_price: "", min_price: "" };
    setFilters(next);
    setSearchParams(hostelOnly ? { city: "Abuja", listing_type: "hostel" } : { city: "Abuja" });
  };

  return (
    <div className="hm-container hm-marketplace">
      <div className="hm-page-intro"><Eyebrow>{hostelOnly ? "Find hostels" : "Find home"}</Eyebrow><h1>{hostelOnly ? <>A campus corner.<br /><em>A place to grow.</em></> : <>Room to live.<br /><em>Space to grow.</em></>}</h1><p>{hostelOnly ? "Explore student accommodation with bed-space availability, session pricing and hostel rules." : "Explore places with useful details, honest pricing and fewer surprises."}</p></div>
      <form className="hm-filter-panel" onSubmit={submit}>
        <label className="hm-filter-search"><Search size={17} /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Search properties, landmarks…" /></label>
        <label><span>City</span><input value={filters.city} onChange={(event) => update("city", event.target.value)} placeholder="Abuja" /></label>
        <label><span>Area</span><input value={filters.area} onChange={(event) => update("area", event.target.value)} placeholder="Any district" /></label>
        {!hostelOnly && <label><span>Property type</span><select value={filters.listing_type} onChange={(event) => update("listing_type", event.target.value)}><option value="">All types</option>{Object.entries(typeLabels).filter(([key]) => key !== "commercial").map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>}
        <label><span>Max rent (₦)</span><input type="number" min="0" value={filters.max_price} onChange={(event) => update("max_price", event.target.value)} placeholder="No limit" /></label>
        <button className="hm-button hm-button-dark" type="submit"><SlidersHorizontal size={16} /> Apply filters</button>
      </form>
      <div className="hm-results-heading"><div><Eyebrow>The shortlist</Eyebrow><h2>{hostelOnly ? "Student hostels" : "Available homes"}</h2></div><span>{listings.length} {listings.length === 1 ? "place" : "places"} found</span></div>
      {loading ? <div className="hm-listing-grid"><div className="hm-skeleton" /><div className="hm-skeleton" /><div className="hm-skeleton" /></div> :
        error ? <div className="hm-inline-error">{error}</div> :
        listings.length ? <div className="hm-listing-grid">{listings.map((listing) => <ListingCard listing={listing} key={listing.id} />)}</div> :
        <EmptyState icon={Filter} title="No listings match those filters.">Try a wider budget or remove a location filter. New places will appear as providers publish them and the team approves them.<button className="hm-button hm-button-outline" onClick={clear}>Clear filters <ArrowRight size={15} /></button></EmptyState>
      }
    </div>
  );
}

function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState({ preferred_at: "", next_of_kin_name: "", next_of_kin_phone: "", message: "" });
  const [viewingBusy, setViewingBusy] = useState(false);
  const [viewingNotice, setViewingNotice] = useState("");

  useEffect(() => {
    api.get("/housing/listings/" + id + "/")
      .then(setListing)
      .catch((err) => setError(err.message));
  }, [id]);

  const submitViewing = async (event) => {
    event.preventDefault();
    if (!user) return navigate("/sign-in");
    setViewingBusy(true); setError(""); setViewingNotice("");
    try {
      await api.post("/housing/viewings/", {
        listing: Number(id),
        preferred_at: new Date(viewingForm.preferred_at).toISOString(),
        next_of_kin_name: viewingForm.next_of_kin_name,
        next_of_kin_phone: viewingForm.next_of_kin_phone,
        message: viewingForm.message,
      });
      setViewingNotice("Your viewing request has been sent to the provider.");
      setViewingOpen(false);
      setViewingForm({ preferred_at: "", next_of_kin_name: "", next_of_kin_phone: "", message: "" });
    } catch (err) { setError(err.message); }
    finally { setViewingBusy(false); }
  };

  const sendEnquiry = async (event) => {
    event.preventDefault();
    if (!user) return navigate("/sign-in");
    setBusy(true); setError(""); setNotice("");
    try {
      await api.post("/housing/enquiries/", { listing: Number(id), message });
      setNotice("Your enquiry has been sent. The provider can now respond through Housemates.");
      setMessage("");
    } catch (err) {
      setError(err.data?.listing?.[0] || err.message);
    } finally { setBusy(false); }
  };

  if (error && !listing) return <div className="hm-container hm-error-page"><p>{error}</p><Link to="/homes" className="hm-text-link"><ArrowLeft size={16} /> Back to homes</Link></div>;
  if (!listing) return <PageLoading />;
  const photo = listing.photos?.[0]?.image;
  const checks = listing.verification_checks || [];
  const owner = listing.owner_name || "Accommodation provider";
  const fees = [
    ["Annual / session rent", listing.rent],
    ["Deposit / caution", listing.deposit],
    ["Agency fee", listing.agency_fee],
    ["Agreement fee", listing.agreement_fee],
    ["Service charge", listing.service_charge],
    ["Estimated utilities", listing.utility_estimate],
  ];

  return (
    <div className="hm-container hm-detail-page">
      <Link to="/homes" className="hm-back"><ArrowLeft size={16} /> All homes</Link>
      <div className="hm-detail-grid">
        <div>
          <div className="hm-detail-image">{photo ? <img src={photo} alt={listing.title} /> : <div className="hm-listing-placeholder"><House size={38} /><span>Find your next chapter</span></div>}</div>
          <div className="hm-detail-title"><Eyebrow>{typeLabels[listing.listing_type] || "Accommodation"}</Eyebrow><h1>{listing.title}</h1><p><MapPin size={15} /> {listing.address_hint ? listing.address_hint + ", " : ""}{listing.area}, {listing.city}</p></div>
          <div className="hm-fact-row"><span><BedDouble size={16} /> {listing.bedrooms} bedrooms</span><span>{listing.bathrooms} bathrooms</span><span>{listing.is_furnished ? "Furnished" : "Unfurnished"}</span><span>Up to {listing.max_occupants} occupants</span></div>
          <section className="hm-detail-section"><h2>About this place</h2><p>{listing.description}</p></section>
          {listing.amenities?.length > 0 && <section className="hm-detail-section"><h2>Everyday essentials</h2><div className="hm-amenities">{listing.amenities.map((item) => <span key={item}><CheckCircle2 size={14} /> {item}</span>)}</div></section>}
          {listing.listing_type === "hostel" && listing.hostel_details && <section className="hm-detail-section"><h2>Hostel information</h2><div className="hm-hostel-info"><span>Institution <b>{listing.hostel_details.institution}</b></span><span>Academic session <b>{listing.hostel_details.session_label || "Not specified"}</b></span><span>Available bed spaces <b>{listing.hostel_details.bedspaces_available}</b></span><span>Session price <b>{money(listing.hostel_details.session_price || listing.rent)}</b></span></div><p>{(listing.hostel_details.rules || []).join(" · ")}</p></section>}
          <section className="hm-detail-section">
            <div className="hm-title-icon"><ShieldCheck size={19} /><h2>Verification evidence</h2></div>
            {checks.length ? checks.map((check) => <div className="hm-check-row" key={check.id}><div><b>{check.check_label}</b><small>{check.evidence_summary || "No additional evidence summary provided."}</small></div><span className={"hm-check-status hm-status-" + check.status}>{check.status_label}</span></div>) : <p className="hm-muted">No verification checks have been recorded for this listing. Arrange an inspection and independently confirm the provider’s authority before making payments.</p>}
            <p className="hm-verification-note">A recorded check describes only what was reviewed. It is not a guarantee of the property or provider.</p>
          </section>
          <div className="hm-detail-actions"><button className="hm-text-button" onClick={() => setReportOpen(true)}><ShieldAlert size={15} /> Report this listing</button><span>Listed by {owner}</span></div>
        </div>
        <aside className="hm-detail-aside">
          <div className="hm-price-card"><Eyebrow>Rent</Eyebrow><div className="hm-price-big">{money(listing.rent)}<small> / {listing.rent_period || "yearly"}</small></div>
            <div className="hm-fee-list">{fees.map(([label, amount]) => <div key={label}><span>{label}</span><b>{money(amount)}</b></div>)}<div className="hm-fee-total"><span>Move-in estimate</span><b>{money(listing.move_in_total)}</b></div></div>
            <small className="hm-fee-disclaimer">Confirm which charges are refundable and request written terms from the provider.</small>
          </div>
          {listing.owner_id !== user?.id && <form className="hm-enquiry-card" onSubmit={sendEnquiry}><h3>Ask about this place</h3><p>Send a question or request more information. Keep early conversations on-platform.</p><textarea required rows="4" maxLength="1000" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Hi, is this property still available? I’d like to arrange an inspection…" /><button disabled={busy || !message.trim()} className="hm-button hm-button-dark hm-button-full">{busy ? "Sending…" : "Send enquiry"} <ArrowUpRight size={15} /></button>{notice && <div className="hm-success">{notice}</div>}{error && <div className="hm-error">{error}</div>}</form>}
          {user && listing.owner_id !== user.id && <button className="hm-button hm-button-outline hm-button-full hm-viewing-toggle" onClick={() => setViewingOpen((value) => !value)}><CalendarDays size={15} /> {viewingOpen ? "Close viewing request" : "Request a property viewing"}</button>}
          {viewingOpen && <form className="hm-enquiry-card hm-viewing-form" onSubmit={submitViewing}><h3>Arrange an inspection</h3><p>Share a preferred time and next-of-kin details for your viewing record.</p><label>Preferred date and time<input type="datetime-local" required value={viewingForm.preferred_at} onChange={(event) => setViewingForm((current) => ({ ...current, preferred_at: event.target.value }))} /></label><label>Next-of-kin name<input required value={viewingForm.next_of_kin_name} onChange={(event) => setViewingForm((current) => ({ ...current, next_of_kin_name: event.target.value }))} /></label><label>Next-of-kin phone<input required value={viewingForm.next_of_kin_phone} onChange={(event) => setViewingForm((current) => ({ ...current, next_of_kin_phone: event.target.value }))} placeholder="+234…" /></label><label>Note <small>Optional</small><textarea rows="3" value={viewingForm.message} onChange={(event) => setViewingForm((current) => ({ ...current, message: event.target.value }))} placeholder="Anything the provider should know before the inspection?" /></label><button disabled={viewingBusy} className="hm-button hm-button-dark hm-button-full">{viewingBusy ? "Sending…" : "Send viewing request"} <ArrowUpRight size={15} /></button></form>}
          {viewingNotice && <div className="hm-success">{viewingNotice}</div>}
          <div className="hm-safety-tip"><ShieldCheck size={17} /><span>Never send a deposit before independently confirming the property, provider and written terms.</span></div>
        </aside>
      </div>
      {reportOpen && <ReportDialog targetType="listing" targetId={listing.id} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

function AuthPage({ register = false }) {
  const { login, register: createAccount } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", display_name: "", role: "seeker", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (register) {
        const username = form.username.trim() || form.email.trim().toLowerCase();
        await createAccount({ ...form, username, display_name: form.display_name.trim() || username });
      } else {
        await login(form.username.trim(), form.password);
      }
      navigate(location.state?.from || (["landlord", "agent", "provider", "hostel", "hostel_operator"].includes(form.role) ? "/provider" : "/profile"));
    } catch (err) {
      const details = err.data || {};
      setError(details.email?.[0] || details.username?.[0] || details.password?.[0] || details.role?.[0] || err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="hm-auth-page">
      <section className="hm-auth-story"><Link to="/" className="hm-brand hm-brand-light"><span className="hm-logo-mark"><House size={18} /></span><span>housemates<span className="hm-brand-dot">.</span><small>UNITING LIKE MINDS</small></span></Link><div><Eyebrow light>A move worth making</Eyebrow><h1>Find your place.<br /><em>Find your people.</em></h1><p>Better housing decisions begin with clearer information and people who share your expectations.</p></div><span className="hm-auth-foot"><ShieldCheck size={15} /> A more thoughtful way to move in.</span></section>
      <section className="hm-auth-form-wrap"><div className="hm-auth-top"><Link to="/" className="hm-back"><ArrowLeft size={15} /> Back to Housemates</Link><span>{register ? "Already a member?" : "New to Housemates?"} <Link to={register ? "/sign-in" : "/join"}>{register ? "Log in" : "Create account"}</Link></span></div>
        <form className="hm-auth-form" onSubmit={submit}><Eyebrow>{register ? "Create your account" : "Welcome back"}</Eyebrow><h2>{register ? "Start with a better move." : "Good to see you again."}</h2><p>{register ? "A few details are all it takes to get started." : "Log in to continue your search and conversations."}</p>
          {register && <><label>Full name<input required value={form.display_name} onChange={(event) => update("display_name", event.target.value)} placeholder="Your name" /></label><label>Username<input required value={form.username} onChange={(event) => update("username", event.target.value)} placeholder="Choose a username" autoComplete="username" /></label><label>Email address<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" /></label><label>Phone number <small>Optional</small><input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+234 800 000 0000" /></label><label>I'm joining as<select value={form.role} onChange={(event) => update("role", event.target.value)}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label></>}
          {!register && <label>Username or email<input required value={form.username} onChange={(event) => update("username", event.target.value)} placeholder="Username or email address" autoComplete="username" /> </label>}
          <label>Password<input required minLength={8} type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 8 characters" autoComplete={register ? "new-password" : "current-password"} /></label>
          {error && <div className="hm-error">{error}</div>}
          <button disabled={busy} className="hm-button hm-button-dark hm-button-full">{busy ? "Please wait…" : register ? "Create account" : "Log in"} <ArrowRight size={16} /></button>
          <small className="hm-terms">By continuing, you agree to use Housemates responsibly and treat other members with respect.</small>
        </form>
      </section>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [areas, setAreas] = useState("");
  const [dealbreakers, setDealbreakers] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/auth/profile/")
      .then((data) => { setProfile(data); setAreas((data.preferred_areas || []).join(", ")); setDealbreakers((data.dealbreakers || []).join(", ")); })
      .catch((err) => setError(err.message));
  }, []);

  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setNotice(""); setError("");
    try {
      const updated = await api.patch("/auth/profile/", {
        ...profile,
        preferred_areas: areas.split(",").map((value) => value.trim()).filter(Boolean),
        dealbreakers: dealbreakers.split(",").map((value) => value.trim()).filter(Boolean),
        budget_min: Number(profile.budget_min || 0),
        budget_max: Number(profile.budget_max || 0),
      });
      setProfile(updated); setNotice("Your living preferences have been saved.");
    } catch (err) {
      setError(err.data?.budget_max?.[0] || err.message);
    } finally { setSaving(false); }
  };

  if (user?.role !== "seeker") {
    return <div className="hm-container hm-marketplace"><EmptyState icon={Users} title="This is a seeker profile.">Provider accounts can publish and manage listings from the provider workspace.</EmptyState></div>;
  }
  if (!profile) return <PageLoading />;

  return (
    <div className="hm-container hm-profile-page"><div className="hm-page-intro"><Eyebrow>Your profile</Eyebrow><h1>Make room for<br /><em>the right fit.</em></h1><p>Better preferences create better introductions. Only add details that are useful for shared living.</p></div>
      <div className="hm-profile-layout"><aside className="hm-profile-aside"><span className="hm-profile-avatar">{(user.display_name || user.username || "H").slice(0,1).toUpperCase()}</span><h3>{user.display_name || user.username}</h3><p>{user.email}</p><small>Home seeker</small><div className="hm-profile-tip">Keep your budget, areas and move-in date current. You can turn housemate discovery off whenever you want.</div></aside>
        <form className="hm-form-card" onSubmit={submit}>
          <section className="hm-form-section"><div className="hm-form-heading"><span>01</span><div><h2>Your move</h2><p>Tell us what brings you to Housemates.</p></div></div>
            <div className="hm-form-grid"><label>I'm a<select value={profile.status} onChange={(event) => update("status", event.target.value)}><option value="student">University student</option><option value="nysc">NYSC member</option><option value="graduate">Fresh graduate</option><option value="professional">Young professional</option></select></label><label>Move-in date<input type="date" value={profile.move_in_date || ""} onChange={(event) => update("move_in_date", event.target.value)} /></label></div>
            <div className="hm-form-grid"><label>Institution<input value={profile.institution || ""} onChange={(event) => update("institution", event.target.value)} placeholder="University or college" /></label><label>Place of primary assignment<input value={profile.ppa || ""} onChange={(event) => update("ppa", event.target.value)} placeholder="For NYSC members" /></label></div>
            <label>Local government area<input value={profile.local_government || ""} onChange={(event) => update("local_government", event.target.value)} placeholder="e.g. AMAC" /></label>
          </section>
          <section className="hm-form-section"><div className="hm-form-heading"><span>02</span><div><h2>Budget & location</h2><p>Set a realistic range and the areas you can see yourself living in.</p></div></div>
            <div className="hm-form-grid"><label>Minimum budget (₦)<input type="number" min="0" value={profile.budget_min || ""} onChange={(event) => update("budget_min", event.target.value)} placeholder="150000" /></label><label>Maximum budget (₦)<input type="number" min="0" value={profile.budget_max || ""} onChange={(event) => update("budget_max", event.target.value)} placeholder="300000" /></label></div>
            <label>Preferred areas <small>Separate with commas</small><input value={areas} onChange={(event) => setAreas(event.target.value)} placeholder="Gwarinpa, Jabi, Wuye" /></label>
          </section>
          <section className="hm-form-section"><div className="hm-form-heading"><span>03</span><div><h2>How you live</h2><p>Compare the everyday habits that shape a shared home.</p></div></div>
            <div className="hm-form-grid"><label>Cleanliness<select value={profile.cleanliness} onChange={(event) => update("cleanliness", Number(event.target.value))}><option value="1">Very relaxed</option><option value="2">Relaxed</option><option value="3">Tidy</option><option value="4">Very tidy</option><option value="5">Meticulous</option></select></label><label>Sleep schedule<select value={profile.sleep_schedule || ""} onChange={(event) => update("sleep_schedule", event.target.value)}><option value="">Not specified</option><option value="early">Early sleeper</option><option value="night_owl">Night owl</option><option value="flexible">Flexible</option></select></label></div>
            <div className="hm-form-grid"><label>Guest frequency<select value={profile.guest_frequency || ""} onChange={(event) => update("guest_frequency", event.target.value)}><option value="">Not specified</option><option value="rarely">Rarely</option><option value="sometimes">Sometimes</option><option value="often">Often</option></select></label><label>Smoking preference<select value={profile.smoking || ""} onChange={(event) => update("smoking", event.target.value)}><option value="">Not specified</option><option value="no">Non-smoker</option><option value="yes">Smokes</option><option value="outside">Outside only</option></select></label></div>
            <div className="hm-form-grid"><label>Pet preference<select value={profile.pets || ""} onChange={(event) => update("pets", event.target.value)}><option value="">Not specified</option><option value="no">No pets</option><option value="yes">Has pets</option><option value="open">Open to pets</option></select></label><label>Work / study routine<select value={profile.work_mode || ""} onChange={(event) => update("work_mode", event.target.value)}><option value="">Not specified</option><option value="onsite">Mostly on-site</option><option value="hybrid">Hybrid</option><option value="remote">Work/study from home</option></select></label></div>
            <label>Noise preference<select value={profile.noise_preference || ""} onChange={(event) => update("noise_preference", event.target.value)}><option value="">Not specified</option><option value="quiet">Quiet home</option><option value="moderate">Moderate activity</option><option value="lively">Lively home</option></select></label>
            <label>Communication style<input value={profile.communication_style || ""} onChange={(event) => update("communication_style", event.target.value)} placeholder="e.g. Direct, calm conversations" /></label>
            <label>Dealbreakers <small>Separate with commas</small><input value={dealbreakers} onChange={(event) => setDealbreakers(event.target.value)} placeholder="e.g. Indoor smoking, loud music at night" /></label>
            <label className="hm-toggle-row"><span><b>Show me in housemate discovery</b><small>You can switch this off whenever you like.</small></span><input type="checkbox" checked={profile.seeking_housemate} onChange={(event) => update("seeking_housemate", event.target.checked)} /></label>
          </section>
          {notice && <div className="hm-success"><CheckCircle2 size={15} /> {notice}</div>}{error && <div className="hm-error">{error}</div>}
          <div className="hm-form-actions"><small>Your preferences are used for relevant housing discovery only.</small><button className="hm-button hm-button-dark" disabled={saving}>{saving ? "Saving…" : "Save preferences"} <Check size={15} /></button></div>
        </form>
      </div>
    </div>
  );
}

function HousematesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sent, setSent] = useState({});
  const [working, setWorking] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/matching/matches/")
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const introduce = async (match) => {
    setWorking(match.user_id); setError("");
    try {
      await api.post("/matching/introductions/", {
        recipient_id: match.user_id,
        message: "Hi, your living preferences look compatible. I'd like to learn a little more about what you're looking for.",
      });
      setSent((current) => ({ ...current, [match.user_id]: true }));
    } catch (err) { setError(err.message); }
    finally { setWorking(null); }
  };

  const block = async (match) => {
    if (!window.confirm("Block " + match.display_name + "? Their profile will no longer appear in your discovery list.")) return;
    try {
      await api.post("/safety/blocks/", { user_id: match.user_id });
      setMatches((current) => current.filter((item) => item.user_id !== match.user_id));
    } catch (err) { setError(err.message); }
  };

  if (!user) return <div className="hm-container hm-marketplace"><div className="hm-page-intro"><Eyebrow>Find housemates</Eyebrow><h1>Share a home.<br /><em>Not your peace.</em></h1><p>Compare lifestyle preferences and request a mutual introduction.</p></div><EmptyState icon={Users} title="Start with your own preferences.">Create an account, tell us how you live and get a shortlist based on relevant compatibility factors.<Link className="hm-button hm-button-dark" to="/join">Create your profile <ArrowRight size={15} /></Link></EmptyState></div>;

  return (
    <div className="hm-container hm-marketplace">
      <div className="hm-page-intro"><Eyebrow>Find housemates</Eyebrow><h1>Share a home.<br /><em>Not your peace.</em></h1><p>Good shared living starts with honest expectations. Compare the things that matter before you decide to meet.</p></div>
      <div className="hm-results-heading"><div><Eyebrow>Your shortlist</Eyebrow><h2>People to get to know</h2></div><Link to="/profile" className="hm-button hm-button-outline"><SlidersHorizontal size={15} /> Edit preferences</Link></div>
      {error && <div className="hm-error">{error}</div>}
      {loading ? <div className="hm-skeleton" /> : matches.length ? <div className="hm-match-grid">{matches.map((match) => (
        <article className="hm-match-card" key={match.user_id}>
          <div className="hm-match-card-top"><span className="hm-match-avatar">{match.avatar ? <img src={match.avatar} alt="" /> : (match.display_name || "H").slice(0,1)}</span><span className="hm-score"><b>{match.score ?? "—"}%</b><small>preference fit</small></span></div>
          <h3>{match.display_name}</h3><p className="hm-persona">{(match.status || "seeker").toUpperCase()}{match.institution ? " · " + match.institution : ""}{match.ppa ? " · " + match.ppa : ""}</p>
          <div className="hm-match-budget">{match.budget_min ? money(match.budget_min) : "Flexible"} – {match.budget_max ? money(match.budget_max) : "Flexible"}<small>budget range</small></div>
          {match.areas?.length > 0 && <p className="hm-match-areas"><MapPin size={13} /> {match.areas.join(", ")}</p>}
          {match.bio && <p className="hm-match-bio">{match.bio}</p>}
          <div className="hm-match-reasons"><b><Sparkles size={14} /> Where you align</b>{match.agreements?.slice(0,3).map((reason, index) => <p key={"a" + index}>{reason}</p>)}{match.differences?.slice(0,2).map((reason, index) => <p className="hm-match-difference" key={"d" + index}>{reason}</p>)}</div>
          <button className="hm-button hm-button-dark hm-button-full" onClick={() => introduce(match)} disabled={Boolean(sent[match.user_id]) || working === match.user_id}>{sent[match.user_id] ? "Introduction sent" : working === match.user_id ? "Sending…" : "Request introduction"} <ArrowRight size={15} /></button>
          <div className="hm-match-card-actions"><button onClick={() => block(match)}>Block</button><button onClick={() => setReportTarget({ type: "user", id: match.user_id })}>Report</button></div>
        </article>
      ))}</div> : <EmptyState icon={HeartHandshake} title="Your shortlist is still taking shape.">No profiles currently meet your hard constraints. Try widening your budget, adding more areas or adjusting your move-in date.<Link className="hm-button hm-button-outline" to="/profile">Review preferences <ArrowRight size={15} /></Link></EmptyState>}
      <p className="hm-matching-disclaimer">A compatibility score is a conversation starter, not a promise. Review the differences and discuss them before committing to a shared home.</p>
      {reportTarget && <ReportDialog targetType={reportTarget.type} targetId={reportTarget.id} onClose={() => setReportTarget(null)} />}
    </div>
  );
}

function IntroductionsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/matching/introductions/").then(setItems).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const respond = async (item, status) => {
    try {
      await api.post("/matching/introductions/" + item.id + "/respond/", { status });
      load();
    } catch (err) { setError(err.message); }
  };

  return <div className="hm-container hm-marketplace"><div className="hm-page-intro"><Eyebrow>Introductions</Eyebrow><h1>Good connections<br /><em>start with consent.</em></h1><p>Manage the people you have asked to meet and the introductions sent to you.</p></div>
    {error && <div className="hm-error">{error}</div>}
    {loading ? <PageLoading /> : items.length ? <div className="hm-inbox-list">{items.map((item) => <article key={item.id}><div><b>{item.is_recipient ? item.sender_name : item.recipient_name}</b><small>{item.is_recipient ? "Would like to meet you" : "You requested an introduction"}</small><p>{item.message}</p></div><div className="hm-inbox-actions"><span className={"hm-state hm-state-" + item.status}>{item.status}</span>{item.is_recipient && item.status === "pending" && <><button className="hm-button hm-button-dark hm-button-sm" onClick={() => respond(item, "accepted")}>Accept</button><button className="hm-button hm-button-outline hm-button-sm" onClick={() => respond(item, "declined")}>Decline</button></>}</div></article>)}</div> : <EmptyState icon={HeartHandshake} title="No introductions yet.">When you find someone with compatible living preferences, send a request and let them decide whether to connect.</EmptyState>}
  </div>;
}

function ProviderPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", listing_type: "flat", city: "Abuja", area: "", address_hint: "",
    rent: "", rent_period: "yearly", deposit: "0", agency_fee: "0", agreement_fee: "0",
    service_charge: "0", utility_estimate: "0", bedrooms: "1", bathrooms: "1", max_occupants: "1",
    available_from: "", amenities: [], house_rules: "", is_furnished: false,
    photo_url: "", institution: "", session_label: "", session_price: "", bedspaces_available: "1",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const amenities = ["24-hour power", "Water supply", "Security", "Parking", "Internet", "Kitchen", "Laundry", "Generator", "Air conditioning"];

  const loadMine = () => api.get("/housing/listings/mine/").then((data) => setListings(listFrom(data))).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { loadMine(); }, []);

  if (!["landlord", "agent", "provider", "hostel", "hostel_operator", "staff"].includes(user?.role)) {
    return <div className="hm-container hm-marketplace"><EmptyState icon={Building2} title="Provider access required.">Create a landlord, agent or hostel-operator account to publish accommodation.<Link to="/join" className="hm-button hm-button-dark">Create provider account</Link></EmptyState></div>;
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleAmenity = (item) => update("amenities", form.amenities.includes(item) ? form.amenities.filter((value) => value !== item) : [...form.amenities, item]);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    const payload = {
      ...form,
      rent: Number(form.rent),
      deposit: Number(form.deposit || 0),
      agency_fee: Number(form.agency_fee || 0),
      agreement_fee: Number(form.agreement_fee || 0),
      service_charge: Number(form.service_charge || 0),
      utility_estimate: Number(form.utility_estimate || 0),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      max_occupants: Number(form.max_occupants),
      house_rules: form.house_rules.split("\n").map((item) => item.trim()).filter(Boolean),
      photos: form.photo_url.trim() ? [{ image: form.photo_url.trim(), caption: "Property photo", sort_order: 0 }] : [],
    };
    if (form.listing_type === "hostel") {
      payload.hostel_details = {
        institution: form.institution,
        session_label: form.session_label,
        session_price: Number(form.session_price || form.rent),
        bedspaces_available: Number(form.bedspaces_available),
        room_types: [],
        rules: payload.house_rules,
      };
    }
    delete payload.photo_url;
    delete payload.institution;
    delete payload.session_label;
    delete payload.session_price;
    delete payload.bedspaces_available;
    try {
      await api.post("/housing/listings/", payload);
      setSuccess("Your listing has been submitted for moderation. It will appear in public search after approval.");
      setForm((current) => ({ ...current, title: "", description: "", rent: "", area: "", address_hint: "", photo_url: "" }));
      setLoading(true);
      loadMine();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <div className="hm-container hm-provider-page">
    <div className="hm-page-intro"><Eyebrow>For accommodation providers</Eyebrow><h1>Put your place<br /><em>on the map.</em></h1><p>Create a clear, accurate listing. Better information means better enquiries.</p></div>
    <div className="hm-provider-layout">
      <form className="hm-form-card" onSubmit={submit}>
        <section className="hm-form-section"><div className="hm-form-heading"><span>01</span><div><h2>About the place</h2><p>Start with the details a seeker needs to recognise the right space.</p></div></div>
          <label>Listing title<input required maxLength="180" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Bright private room in Wuye" /></label>
          <label>Description<textarea required maxLength="4000" rows="5" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the accommodation, who it suits and what a viewing should cover." /></label>
          <div className="hm-form-grid"><label>Property type<select value={form.listing_type} onChange={(event) => update("listing_type", event.target.value)}><option value="flat">Entire apartment</option><option value="house">House</option><option value="room">Room in shared apartment</option><option value="private">Private room</option><option value="shared">Shared apartment</option>{["hostel", "hostel_operator", "staff"].includes(user.role) && <option value="hostel">Student hostel</option>}</select></label><label>Available from<input type="date" value={form.available_from || ""} onChange={(event) => update("available_from", event.target.value)} /></label></div>
          <div className="hm-form-grid"><label>Street / address hint<input required value={form.address_hint} onChange={(event) => update("address_hint", event.target.value)} placeholder="Estate or street name" /></label><label>Area / district<input required value={form.area} onChange={(event) => update("area", event.target.value)} placeholder="e.g. Wuye" /></label></div>
          <div className="hm-form-grid"><label>City<input required value={form.city} onChange={(event) => update("city", event.target.value)} /></label><label>Maximum occupants<input type="number" min="1" value={form.max_occupants} onChange={(event) => update("max_occupants", event.target.value)} /></label></div>
          {form.listing_type === "hostel" && <div className="hm-hostel-fields"><h3>Hostel details</h3><div className="hm-form-grid"><label>Institution<input required value={form.institution} onChange={(event) => update("institution", event.target.value)} placeholder="Institution served" /></label><label>Academic session<input value={form.session_label} onChange={(event) => update("session_label", event.target.value)} placeholder="2026/2027" /></label></div><div className="hm-form-grid"><label>Bed spaces available<input type="number" min="0" value={form.bedspaces_available} onChange={(event) => update("bedspaces_available", event.target.value)} /></label><label>Session price (₦)<input type="number" min="0" value={form.session_price} onChange={(event) => update("session_price", event.target.value)} /></label></div></div>}
        </section>
        <section className="hm-form-section"><div className="hm-form-heading"><span>02</span><div><h2>Make the costs clear</h2><p>Show rent and each mandatory charge separately. No unpleasant arithmetic at inspection.</p></div></div>
          <div className="hm-form-grid"><label>Rent (₦)<input required type="number" min="0" value={form.rent} onChange={(event) => update("rent", event.target.value)} placeholder="250000" /></label><label>Rent period<select value={form.rent_period} onChange={(event) => update("rent_period", event.target.value)}><option value="monthly">Per month</option><option value="yearly">Per year</option><option value="session">Per academic session</option></select></label></div>
          <div className="hm-form-grid hm-fee-grid"><label>Deposit / caution (₦)<input type="number" min="0" value={form.deposit} onChange={(event) => update("deposit", event.target.value)} /></label><label>Agency fee (₦)<input type="number" min="0" value={form.agency_fee} onChange={(event) => update("agency_fee", event.target.value)} /></label><label>Agreement fee (₦)<input type="number" min="0" value={form.agreement_fee} onChange={(event) => update("agreement_fee", event.target.value)} /></label><label>Service charge (₦)<input type="number" min="0" value={form.service_charge} onChange={(event) => update("service_charge", event.target.value)} /></label><label>Utility estimate (₦)<input type="number" min="0" value={form.utility_estimate} onChange={(event) => update("utility_estimate", event.target.value)} /></label></div>
          <div className="hm-cost-preview"><span>Move-in estimate</span><b>{money([form.rent, form.deposit, form.agency_fee, form.agreement_fee, form.service_charge, form.utility_estimate].reduce((sum, value) => sum + Number(value || 0), 0))}</b></div>
        </section>
        <section className="hm-form-section"><div className="hm-form-heading"><span>03</span><div><h2>Everyday details</h2><p>Give seekers a better picture of the living arrangement.</p></div></div>
          <div className="hm-form-grid"><label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} /></label><label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} /></label></div>
          <label>Photo URL <small>Optional in this release</small><input type="url" value={form.photo_url} onChange={(event) => update("photo_url", event.target.value)} placeholder="https://…" /></label>
          <div className="hm-amenity-picker"><b>Amenities</b><div>{amenities.map((item) => <button type="button" key={item} className={form.amenities.includes(item) ? "is-selected" : ""} onClick={() => toggleAmenity(item)}>{form.amenities.includes(item) ? <Check size={13} /> : <Plus size={13} />}{item}</button>)}</div></div>
          <label>House rules <small>One rule per line</small><textarea rows="3" value={form.house_rules} onChange={(event) => update("house_rules", event.target.value)} placeholder={"Quiet hours after 10pm\nVisitors by arrangement"} /></label>
          <label className="hm-check-input"><input type="checkbox" checked={form.is_furnished} onChange={(event) => update("is_furnished", event.target.checked)} /> This property is furnished</label>
        </section>
        {error && <div className="hm-error">{error}</div>}{success && <div className="hm-success">{success}</div>}
        <div className="hm-form-actions"><small>New listings enter moderation before they appear in public search.</small><button disabled={busy} className="hm-button hm-button-dark">{busy ? "Submitting…" : "Submit listing"} <ArrowRight size={15} /></button></div>
      </form>
      <aside className="hm-provider-sidebar"><h3>Your listings</h3><p>Listings you submit appear here with their moderation status.</p>{loading ? <span>Loading…</span> : listings.length ? listings.map((item) => <div className="hm-provider-listing" key={item.id}><b>{item.title}</b><small>{item.area}, {item.city}</small><span className={"hm-state hm-state-" + item.status}>{item.status}</span></div>) : <p>You haven't published any accommodation yet.</p>}<div className="hm-provider-tip"><ShieldCheck size={17} /><span>Verification is recorded as separate checks. We never describe a listing as fully verified based on an unrelated check.</span></div></aside>
    </div>
  </div>;
}

function EnquiriesPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = () => api.get("/housing/enquiries/").then((data) => setItems(listFrom(data))).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (item, status) => {
    try { await api.patch("/housing/enquiries/" + item.id + "/", { status }); load(); }
    catch (err) { setError(err.message); }
  };

  return <div className="hm-container hm-marketplace"><div className="hm-page-intro"><Eyebrow>Enquiries</Eyebrow><h1>Conversations that<br /><em>move things forward.</em></h1><p>Listing questions and provider responses stay connected to the accommodation.</p></div>
    {error && <div className="hm-error">{error}</div>}
    {loading ? <PageLoading /> : items.length ? <div className="hm-inbox-list">{items.map((item) => {
      const isOwner = user?.id !== item.seeker;
      return <article key={item.id}><div><b>{item.listing_title || "Property enquiry"}</b><small>{isOwner ? "From " + item.seeker_name : "Your enquiry"} · {new Date(item.created_at).toLocaleDateString()}</small><p>{item.message}</p></div><div className="hm-inbox-actions"><span className={"hm-state hm-state-" + item.status}>{item.status}</span>{isOwner && item.status === "new" && <button className="hm-button hm-button-dark hm-button-sm" onClick={() => updateStatus(item, "responded")}>Mark responded</button>}{isOwner && item.status !== "closed" && <button className="hm-button hm-button-outline hm-button-sm" onClick={() => updateStatus(item, "closed")}>Close</button>}</div></article>;
    })}</div> : <EmptyState icon={MessageCircle} title="Nothing in your inbox yet.">When someone asks about a property, or you send your first enquiry, it will show up here.</EmptyState>}
  </div>;
}


function ViewingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => api.get("/housing/viewings/").then((data) => setItems(listFrom(data))).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const update = async (item, payload) => {
    try { await api.patch("/housing/viewings/" + item.id + "/", payload); load(); }
    catch (err) { setError(err.message); }
  };
  return <div className="hm-container hm-marketplace"><div className="hm-page-intro"><Eyebrow>Property viewings</Eyebrow><h1>Inspect with care.<br /><em>Move with confidence.</em></h1><p>Track inspection requests, confirmations and post-viewing outcomes.</p></div>
    {error && <div className="hm-error">{error}</div>}
    {loading ? <PageLoading /> : items.length ? <div className="hm-inbox-list">{items.map((item) => {
      const isProvider = user.id !== item.seeker;
      return <article key={item.id}><div><b>{item.listing_title}</b><small>{isProvider ? "Requested by " + item.seeker_name : "Your viewing request"} · {new Date(item.preferred_at).toLocaleString()}</small><p>{item.message || "No additional note provided."}</p><p>Next of kin: {item.next_of_kin_name} · {item.next_of_kin_phone}</p></div><div className="hm-inbox-actions"><span className={"hm-state hm-state-" + item.status}>{item.status}</span>{item.outcome && <span className="hm-state hm-state-accepted">{item.outcome}</span>}{isProvider && item.status === "requested" && <><button className="hm-button hm-button-dark hm-button-sm" onClick={() => update(item,{status:"confirmed"})}>Confirm</button><button className="hm-button hm-button-outline hm-button-sm" onClick={() => update(item,{status:"declined"})}>Decline</button></>}{isProvider && item.status === "confirmed" && <button className="hm-button hm-button-dark hm-button-sm" onClick={() => update(item,{status:"completed"})}>Mark completed</button>}{!isProvider && ["requested","confirmed"].includes(item.status) && <button className="hm-button hm-button-outline hm-button-sm" onClick={() => update(item,{status:"cancelled"})}>Cancel</button>}{!isProvider && item.status === "completed" && !item.outcome && <><button className="hm-button hm-button-dark hm-button-sm" onClick={() => update(item,{outcome:"successful"})}>Successful</button><button className="hm-button hm-button-outline hm-button-sm" onClick={() => update(item,{outcome:"unsuccessful"})}>Not successful</button></>}</div></article>;
    })}</div> : <EmptyState icon={CalendarDays} title="No viewings scheduled yet.">When you request an inspection or a provider confirms one, the details and status will appear here.</EmptyState>}
  </div>;
}

function ReportDialog({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState("potential_scam");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await api.post("/safety/reports/", { target_type: targetType, target_id: targetId, reason, details });
      onClose();
      window.alert("Your report has been submitted for review.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <div className="hm-modal-backdrop" onClick={onClose}><form className="hm-report-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><button type="button" className="hm-modal-close" onClick={onClose}><X size={18} /></button><Eyebrow>Trust & safety</Eyebrow><h2>Report this {targetType === "listing" ? "listing" : "profile"}</h2><label>What is the issue?<select value={reason} onChange={(event) => setReason(event.target.value)}><option value="potential_scam">Potential scam or suspicious payment request</option><option value="fake_listing">Potentially fake listing</option><option value="inaccurate">Inaccurate information</option><option value="harassment">Harassment or abusive behaviour</option><option value="safety">Safety concern</option><option value="other">Other</option></select></label><label>Additional details<textarea rows="4" maxLength="1200" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Tell the moderation team what happened." /></label>{error && <div className="hm-error">{error}</div>}<button disabled={busy} className="hm-button hm-button-dark hm-button-full">{busy ? "Submitting…" : "Submit report"}</button></form></div>;
}

function NotFound() {
  return <div className="hm-container hm-marketplace"><EmptyState icon={House} title="That page moved out.">The address may be incorrect, or the page is no longer available.<Link to="/" className="hm-button hm-button-dark">Back home</Link></EmptyState></div>;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <PageLoading />;
  return (
    <Routes><Route element={<SiteLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/homes" element={<ListingsPage />} />
      <Route path="/homes/:id" element={<ListingDetailPage />} />
      <Route path="/hostels" element={<ListingsPage hostelOnly />} />
      <Route path="/housemates" element={<HousematesPage />} />
      <Route path="/introductions" element={<Protected><IntroductionsPage /></Protected>} />
      <Route path="/enquiries" element={<Protected><EnquiriesPage /></Protected>} />
      <Route path="/viewings" element={<Protected><ViewingsPage /></Protected>} />
      <Route path="/sign-in" element={<AuthPage />} />
      <Route path="/join" element={<AuthPage register />} />
      <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
      <Route path="/provider" element={<Protected><ProviderPage /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Route></Routes>
  );
}
