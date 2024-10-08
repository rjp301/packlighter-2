import React from "react";
import UserAvatar from "@/components/user-avatar";
import SidebarButton from "./sidebar/sidebar-button";
import { NAVBAR_HEIGHT } from "@/lib/constants";

type Props = React.PropsWithChildren;

const AppHeader: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <header
      className="flex items-center border-b"
      style={{ height: NAVBAR_HEIGHT }}
    >
      <div className="container2 flex items-center">
        <SidebarButton hideWhenSidebarOpen className="mr-2" />
        <div className="flex w-full items-center gap-4">
          <div className="flex flex-1 items-center justify-between gap-2">
            {children}
          </div>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
