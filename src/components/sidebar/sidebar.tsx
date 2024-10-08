import { cn } from "@/lib/utils";
import React from "react";
import Logo from "../logo";
import PackingItems from "../packing-items/packing-items";
import PackingLists from "../packing-lists/packing-lists";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import useSidebarStore from "./store";
import { useMediaQuery } from "usehooks-ts";
import { MOBILE_MEDIA_QUERY, NAVBAR_HEIGHT } from "@/lib/constants";
import SidebarButton from "./sidebar-button";

import { Sheet, SheetContent } from "@/components/ui/sheet";

type ContentProps = {
  noButton?: boolean;
};

const SideBarContent: React.FC<ContentProps> = ({ noButton }) => (
  <div className="flex h-full flex-col overflow-hidden">
    <header
      className={cn("flex items-center border-b gap-2", noButton && "pl-4")}
      style={{ height: NAVBAR_HEIGHT }}
    >
      {!noButton && <SidebarButton />}
      <Logo />
    </header>
    <ResizablePanelGroup autoSaveId="sidebar-panels" direction="vertical">
      <ResizablePanel defaultSize={40}>
        <PackingLists />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <PackingItems />
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

const SideBar: React.FC = () => {
  const { isMobileSidebarOpen, isDesktopSidebarOpen, toggleMobileSidebar } =
    useSidebarStore();

  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  if (isMobile) {
    return (
      <Sheet open={isMobileSidebarOpen} onOpenChange={toggleMobileSidebar}>
        <SheetContent side="left" className="w-[280px] overflow-hidden p-0">
          <SideBarContent noButton />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "flex w-[280px] border-r bg-card transition-all ease-out",
        !isDesktopSidebarOpen && "w-0 border-none opacity-0",
      )}
    >
      <SideBarContent />
    </aside>
  );
};

export default SideBar;
