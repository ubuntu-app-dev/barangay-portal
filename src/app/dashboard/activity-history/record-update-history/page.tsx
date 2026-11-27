import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ChangeHistory from "@/components/dashboard/ui/ChangeHistory";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireSession } from "@/lib/auth/session";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { AUDIT_ACTION, label, options } from "@/lib/labels";
import { flat, type SearchParams } from "@/server/params";
import { listActivity } from "@/server/queries/activity";

export const metadata: Metadata = { title: "Record Update History" };

const BASE = "/dashboard/activity-history/record-update-history";
const LINKS: Record<string, string> = {
  Resident: "/dashboard/resident-management/resident-records/",
  Household: "/dashboard/resident-management/household-records/",
  BlotterEntry: "/dashboard/blotter-and-incident-management/blotter-records/",
  IssuedDocument: "/dashboard/document-management/print/",
  Submission: "/dashboard/municipal-submissions/submission-history/",
};
const ENTITY: Record<string, string> = { BlotterEntry: "Blotter entry", IssuedDocument: "Issued document", DocumentRequest: "Document request", DocumentType: "Document settings", CommunityResource: "Community resource", BarangayOfficial: "Official", BarangayBody: "Council or body", User: "Account" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const list = await listActivity(session, sp, true);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Activity History" icon="edit" title="Record Update History" description="Corrections, archives, and voided documents, with the old and new value of each field." />
      <Card title={`${formatNumber(list.total)} entr${list.total === 1 ? "y" : "ies"}`} icon="edit">
        <ListToolbar
          placeholder="Search what happened or who did it"
          filters={[
            ...(true ? [] : [{ name: "action", label: "Action", options: options(AUDIT_ACTION).filter((o) => o.value !== "LOGIN_FAILED") }]),
            { name: "entity", label: "Record", options: list.entities.map((e) => ({ value: e, label: ENTITY[e] ?? e })) },
            { name: "who", label: "By", options: [{ value: "me", label: "Me only" }] },
          ]}
        />
        {list.rows.length === 0 ? (
          <EmptyState icon="history" title="Nothing found" text="Try a different search or clear the filters." />
        ) : true ? (
          <ChangeHistory rows={list.rows} />
        ) : (
          <ol className="divide-y divide-rule/70">
            {list.rows.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-primary-soft text-dash-primary">
                    <Icon name={a.action === "LOGIN" || a.action === "LOGOUT" ? "key" : a.action === "EXPORT" ? "download" : a.action === "CREATE" ? "plus" : a.action === "DELETE" || a.action === "VOID" ? "trash" : "edit"} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold leading-snug">
                      {a.entityId && LINKS[a.entityType] && a.action !== "DELETE" ? (
                        <Link href={`${LINKS[a.entityType]}${a.entityId}`} className="hover:text-dash-primary hover:underline">
                          {a.summary}
                        </Link>
                      ) : (
                        a.summary
                      )}
                    </p>
                    <p className="text-[12.5px] text-ink-secondary">
                      {a.actorName} · {label(AUDIT_ACTION, a.action)} · {ENTITY[a.entityType] ?? a.entityType}
                    </p>
                  </div>
                </div>
                <time dateTime={a.createdAt.toISOString()} className="whitespace-nowrap text-[12.5px] text-ink-secondary">
                  {formatDateTime(a.createdAt.toISOString())}
                </time>
              </li>
            ))}
          </ol>
        )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={BASE} />
      </Card>
    </div>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
