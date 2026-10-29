import LandingPageForm from "../_components/LandingPageForm";

export default function AddLandingPagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Create Landing Page</h3>
        <p className="text-muted-foreground">
          Build a dedicated campaign page for one of your products — perfect for
          Facebook/Google ad traffic with a focused, guest-checkout order form.
        </p>
      </div>

      <LandingPageForm mode="create" />
    </div>
  );
}
