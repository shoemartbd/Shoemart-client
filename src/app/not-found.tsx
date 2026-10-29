import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000, #111111, #0a0a0a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(238,138,30,0.2) 0%, transparent 70%)",
          top: "-10%",
          right: "-5%",
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          background:
            "radial-gradient(circle, rgba(79,143,208,0.18) 0%, transparent 70%)",
          bottom: "5%",
          left: "-5%",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
        @keyframes floatIn { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        .not-found-num {
          animation: float 4s ease-in-out infinite, floatIn 0.7s ease forwards;
          background: linear-gradient(120deg, #ff8a92, #ef3340, #f5f5f5, #ff8a92);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite, float 5s ease-in-out infinite;
        }
        .not-found-card { animation: floatIn 0.5s ease forwards; }
        .nf-btn-primary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 14px 40px rgba(238,138,30,0.5) !important; }
        .nf-btn-primary { transition: all 0.25s ease !important; }
        .nf-btn-ghost:hover { background:rgba(255,255,255,0.12) !important; transform:translateY(-2px); }
        .nf-btn-ghost { transition: all 0.25s ease !important; }
      `}</style>

      <div
        className="not-found-card"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: "64px 56px",
          maxWidth: 560,
          width: "90%",
          textAlign: "center",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* 404 number */}
        <h1
          className="not-found-num"
          style={{
            fontSize: "clamp(80px,18vw,130px)",
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 4,
            letterSpacing: -4,
          }}
        >
          404
        </h1>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(238,138,30,0.15)",
            border: "1px solid rgba(238,138,30,0.3)",
            borderRadius: 100,
            padding: "5px 16px",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ef3340",
              display: "inline-block",
            }}
          />
          <span
            style={{
              color: "#ffb3b8",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Page Not Found
          </span>
        </div>

        {/* Message */}
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 16,
            lineHeight: 1.75,
            marginBottom: 40,
            maxWidth: 360,
            margin: "0 auto 40px",
          }}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved to another location.
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)",
            marginBottom: 36,
          }}
        />

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            className="nf-btn-primary"
            style={{
              background: "linear-gradient(135deg, #d7141f, #ef3340)",
              color: "#fff",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 6px 24px rgba(238,138,30,0.4)",
            }}
          >
            🏠 Back to Home
          </Link>
          {/* <Link
            href="javascript:history.back()"
            className="nf-btn-ghost"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ← Go Back
          </Link> */}
        </div>
      </div>
    </div>
  );
}
