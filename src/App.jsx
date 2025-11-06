import MainLayout from "./layout/MainLayout";
import ContactsSidebar from "./components/ContactsSidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <MainLayout>
      <h1 className="text-red-500 text-5xl">TAILWIND IS WORKING</h1>

      <ContactsSidebar />
      <ChatWindow />
    </MainLayout>
  );
}

export default App;
