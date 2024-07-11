import React from "react";
import { Drawer, DrawerContent } from "../ui/drawer";
import type { ItemSelect } from "db/types";
import ItemForm from "./item-form";

type Props = {
  item: ItemSelect;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ItemEditor: React.FC<Props> = (props) => {
  const { isOpen, setIsOpen, item } = props;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-auto px-4 py-2 pb-6">
          <div className="pb-4 text-xl font-bold">Edit Gear</div>
          <ItemForm item={item} setIsOpen={setIsOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ItemEditor;
