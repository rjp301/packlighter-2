import React from "react";
import Markdown from "react-markdown";
import ViewerCategory from "./list-viewer-category";
import type { ExpandedList } from "@/lib/types";
import WeightPanel from "../weight-chart/weight-panel";

type Props = {
  list: ExpandedList;
};

const ViewerList: React.FC<Props> = (props) => {
  const { list } = props;

  return (
    <div className="prose prose-sm dark:prose-invert grid w-full max-w-none gap-8 px-2 text-sm">
      <Markdown>{`# ${list.name}\n` + list.description}</Markdown>
      <WeightPanel list={list} />
      {list.categories.map((category) => (
        <ViewerCategory key={category.id} category={category} list={list} />
      ))}
    </div>
  );
};

export default ViewerList;
