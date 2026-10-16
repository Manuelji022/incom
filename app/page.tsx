import { Header } from "@/components/header";
import { CompoundInputSidebar } from "@/components/compound-input-sidebar";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-page">
      <Header />
      <main className="grid flex-1 grid-cols-1 lg:min-h-[65.125rem] lg:grid-cols-[18.25rem_minmax(0,1fr)_19.5rem]">
        <CompoundInputSidebar />
        <div
          aria-hidden="true"
          className="hidden min-h-full border-r border-border-subtle lg:block"
        />
        <div aria-hidden="true" className="hidden min-h-full lg:block" />
      </main>
      <Footer />
    </div>
  );
}
