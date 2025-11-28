import { useApp } from "@/context/AppContext";
import { Button } from "./ui/button";
import { Handshake, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const { content, language, loading } = useApp();
  const navigate = useNavigate();

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!content) return <div className="text-center py-20">No Data Found</div>;

  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-5xl font-bold mb-4">
        {language === "ar" ? content.hero.title_ar : content.hero.title_en}
      </h1>

      <p className="text-xl mb-8 max-w-3xl">
        {language === "ar" ? content.hero.subtitle_ar : content.hero.subtitle_en}
      </p>
{/* 
      <div className="flex gap-4">
        <Button onClick={() => navigate("/admin/login")}>
          <User className="mr-2" />
          {language === "ar" ? "تسجيل الدخول" : "Log In"}
        </Button>

        <Button onClick={() => navigate("/admin/login")}>
          <Handshake className="mr-2" />
          {language === "ar" ? "تسجيل الدخول" : "Log In"}
        </Button>
      </div> */}
    </section>
  );
};
