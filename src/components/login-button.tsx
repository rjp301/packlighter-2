import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";

import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { UserRound } from "lucide-react";

const authProviders: Record<
  string,
  { string: string; url: string; icon: React.ReactNode; className?: string }
> = {
  github: {
    string: "Continue with GitHub",
    url: "/login/github",
    icon: <FaGithub className="mr-2 h-5 w-5" />,
    className:
      "bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 shadow",
  },
  google: {
    string: "Continue with Google",
    url: "/login/google",
    icon: <FcGoogle className="mr-2 h-5 w-5" />,
    className:
      "bg-white text-black hover:bg-gray-100 shadow border border-gray-300",
  },
  guest: {
    string: "Continue as Guest",
    url: "/login/guest",
    icon: <UserRound className="mr-2 h-5 w-5" />,
  },
};

type Props = {
  className?: string;
  provider: keyof typeof authProviders;
};

const LoginButton: React.FC<Props> = (props) => {
  const { className, provider } = props;
  const authProvider = authProviders[provider];
  return (
    <a
      className={cn(
        "relative",
        buttonVariants({ size: "lg", variant: "secondary" }),
        authProvider.className,
        className,
      )}
      href={authProvider.url}
    >
      <span className="absolute left-6">{authProvider.icon}</span>
      <span>{authProvider.string}</span>
    </a>
  );
};

export default LoginButton;
