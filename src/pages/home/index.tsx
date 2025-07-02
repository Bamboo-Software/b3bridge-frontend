
import BridgeFormWrap from "./components/BridgeFormWrap";

const Home = () => {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BridgeFormWrap />
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Powered by B3Bridge Protocol - Secure, Fast, and Reliable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;