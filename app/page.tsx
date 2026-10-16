import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col justify-between bg-page">
      <Header />
      <Footer />
    </div>
  );
}
