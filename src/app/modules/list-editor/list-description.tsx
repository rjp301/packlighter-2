import React from "react";
import Markdown from "react-markdown";
import useMutations from "@/app/hooks/use-mutations";
import { flushSync } from "react-dom";
import invariant from "tiny-invariant";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { Button, Link, Text, TextArea } from "@radix-ui/themes";
import type { ListSelect } from "@/lib/types";

const focusInputAtEnd = (inputElement: HTMLTextAreaElement) => {
  if (inputElement) {
    inputElement.focus();
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
  }
};

const ListDescriptionForm = React.forwardRef<
  HTMLFormElement,
  {
    initialValue: string;
    onSubmit: (value: string) => void;
    inputRef: React.RefObject<HTMLTextAreaElement>;
  }
>(({ initialValue, onSubmit, inputRef }, ref) => {
  const [value, setValue] = React.useState(initialValue);

  useEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit(value);
  });

  return (
    <form
      ref={ref}
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <div className="flex items-center gap-2">
        <Text as="label" htmlFor="description" size="2" weight="medium" mr="2">
          Description
        </Text>
        <Button size="1" variant="ghost" type="submit">
          Save changes
        </Button>
        <Button
          size="1"
          variant="ghost"
          color="amber"
          type="submit"
          onClick={() => setValue(initialValue)}
        >
          <span>Cancel</span>
        </Button>
      </div>
      <TextArea
        ref={inputRef}
        id="description"
        name="description"
        value={value}
        rows={3}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />
      <Link
        size="1"
        color="gray"
        href="https://www.markdownguide.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Markdown supported
      </Link>
    </form>
  );
});

const ListDescription: React.FC<{
  list: ListSelect;
}> = ({ list }) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const { updateList } = useMutations();

  useOnClickOutside(formRef, () => setIsEditing(false));
  useEventListener("keydown", (e) => {
    if (e.key === "Escape") setIsEditing(false);
  });

  const [isEditing, setIsEditing] = React.useState(false);

  if (isEditing) {
    return (
      <ListDescriptionForm
        ref={formRef}
        inputRef={inputRef}
        initialValue={list.description}
        onSubmit={(value) => {
          updateList.mutate({ listId: list.id, data: { description: value } });
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <section className="grid gap-2">
      <div className="flex items-center gap-2">
        <Text as="label" htmlFor="description" size="2" weight="medium" mr="2">
          Description
        </Text>
        <Button
          onClick={() => {
            flushSync(() => {
              setIsEditing(true);
            });
            const textarea = inputRef.current;
            invariant(textarea);
            focusInputAtEnd(textarea);
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
          }}
          size="1"
          variant="ghost"
        >
          Edit
        </Button>
      </div>
      <div className="rounded-3 bg-gray-2 prose prose-sm dark:prose-invert max-w-none p-4 text-sm shadow">
        <Markdown>{list.description || "*No description*"}</Markdown>
      </div>
    </section>
  );
};

export default ListDescription;
