import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";

export default function Home() {
  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Header />
        <div className="h-[65vh] flex">
          <ChatSection />
        </div>
      </div>
    </main>
  );
}
