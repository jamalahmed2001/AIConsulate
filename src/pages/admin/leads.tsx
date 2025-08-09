import Head from "next/head";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Section } from "@/components/ui/Section";
import { api } from "@/utils/api";

export default function AdminLeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    data: leads,
    refetch,
    isLoading,
  } = api.lead.list.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const markHandled = api.lead.markHandled.useMutation({
    onSuccess: () => void refetch(),
  });

  useEffect(() => {
    if (status === "unauthenticated") void router.replace("/");
  }, [status, router]);

  return (
    <>
      <Head>
        <title>Admin · Leads</title>
      </Head>
      <main>
        <Section title="Leads" subtitle={session?.user?.email ?? undefined}>
          {isLoading ? (
            <p>Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-neutral-500">
                    <th className="py-2">Created</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Company</th>
                    <th className="py-2">Budget</th>
                    <th className="py-2">Handled</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(leads ?? []).map((l) => (
                    <tr key={l.id} className="border-b">
                      <td className="py-2 align-top">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 align-top">{l.name}</td>
                      <td className="py-2 align-top">{l.email}</td>
                      <td className="py-2 align-top">{l.company ?? "—"}</td>
                      <td className="py-2 align-top">{l.budget ?? "—"}</td>
                      <td className="py-2 align-top">
                        {l.handled ? "Yes" : "No"}
                      </td>
                      <td className="py-2 align-top">
                        <button
                          className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                          onClick={() =>
                            markHandled.mutate({
                              id: l.id,
                              handled: !l.handled,
                            })
                          }
                        >
                          Mark {l.handled ? "Unhandled" : "Handled"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </main>
    </>
  );
}
