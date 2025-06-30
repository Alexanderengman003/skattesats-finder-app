
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome to MinSkatt</h1>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            Your tax calculation and analytics platform.
          </p>
          
          <div className="flex gap-4">
            <Link to="/analytics">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View Analytics Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
