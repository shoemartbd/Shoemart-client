import Link from "next/link";
import { SquarePen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_ROWS = [
  { title: "Home", href: "/admin/dashboard/home-categories" },
  { title: "About Us", href: "/admin/dashboard/pages/about-us" },
  {
    title: "Terms and Conditions",
    href: "/admin/dashboard/pages/terms-and-conditions",
  },
  { title: "Privacy Policy", href: "/admin/dashboard/pages/privacy-policy" },
  { title: "Refund Policy", href: "/admin/dashboard/pages/refund-policy" },
  {
    title: "Frequently Asked Questions",
    href: "/admin/dashboard/pages/faq",
  },
];

export default function PagesHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Pages</h3>
        <p className="text-muted-foreground">
          Manage the static content pages shown on the storefront.
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAGE_ROWS.map((row) => (
              <TableRow key={row.href}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={row.href}
                    aria-label={`Edit ${row.title}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <SquarePen className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
