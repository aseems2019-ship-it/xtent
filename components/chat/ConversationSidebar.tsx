"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Search,
  Pin,
  ChevronRight,
  ChevronDown,
  Folder,
  MoreVertical,
} from "lucide-react";

import {
  createConversation,
  getConversations,
  deleteConversation,
  renameConversation,
  togglePinConversation,
  moveConversationToFolder,
} from "@/services/conversations";

import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
} from "@/services/folders";

import { DndContext } from "@dnd-kit/core";
import ChatItem from "./ChatItem";
import FolderDropZone from "./FolderDropZone";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  pinned: boolean;
  folder_id: string | null;
}

interface FolderType {
  id: string;
  name: string;
  created_at: string;
}

export default function ConversationSidebar() {
  const router = useRouter();

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [folders, setFolders] = useState<FolderType[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [expandedFolders, setExpandedFolders] =
    useState<Record<string, boolean>>({});

  const [editingFolderId, setEditingFolderId] =
    useState<string | null>(null);

  const [editingFolderName, setEditingFolderName] =
    useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadConversations();
    loadFolders();

    function handleRefresh() {
      loadConversations();
      loadFolders();
    }

    window.addEventListener(
      "conversation-updated",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "conversation-updated",
        handleRefresh
      );
    };
  }, []);

  async function loadConversations() {
    setLoading(true);

    try {
      const data = await getConversations();

      setConversations(
        (data ?? []) as Conversation[]
      );
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    try {
      const data = await getFolders();

      setFolders(
        (data ?? []) as FolderType[]
      );
    } catch (error) {
      console.error(
        "Failed to load folders:",
        error
      );
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return conversations
      .filter((chat) =>
        chat.title
          .toLowerCase()
          .includes(query)
      )
      .sort(
        (a, b) =>
          Number(b.pinned) -
          Number(a.pinned)
      );
  }, [conversations, search]);

  const pinnedChats =
    filteredConversations.filter(
      (chat) =>
        chat.pinned &&
        chat.folder_id === null
    );

  const recentChats =
    filteredConversations.filter(
      (chat) =>
        !chat.pinned &&
        chat.folder_id === null
    );

  // =====================================================
  // NEW CHAT
  // =====================================================

  async function handleNewChat() {
    const conversation =
      await createConversation();

    if (!conversation) {
      console.error(
        "Unable to create conversation."
      );
      return;
    }

    await loadConversations();

    window.dispatchEvent(
      new Event("conversation-updated")
    );

    router.push(
      `/chat/${conversation.id}`
    );

    router.refresh();
  }

  // =====================================================
  // DELETE CHAT
  // =====================================================

  async function handleDelete(
    conversationId: string
  ) {
    const confirmed = window.confirm(
      "Delete this conversation?"
    );

    if (!confirmed) return;

    const success =
      await deleteConversation(
        conversationId
      );

    if (!success) return;

    await loadConversations();

    window.dispatchEvent(
      new Event("conversation-updated")
    );

    router.push("/chat");
  }

  // =====================================================
  // RENAME CHAT
  // =====================================================

  async function finishRename(
    conversationId: string
  ) {
    const title =
      editingTitle.trim();

    if (!title) return;

    const success =
      await renameConversation(
        conversationId,
        title
      );

    if (success) {
      setEditingId(null);
      setEditingTitle("");

      await loadConversations();

      window.dispatchEvent(
        new Event("conversation-updated")
      );
    }
  }

  // =====================================================
  // PIN / UNPIN
  // =====================================================

  async function handleTogglePin(
    chat: Conversation
  ) {
    const success =
      await togglePinConversation(
        chat.id,
        chat.pinned
      );

    if (!success) return;

    await loadConversations();

    window.dispatchEvent(
      new Event("conversation-updated")
    );
  }

  // =====================================================
  // CREATE FOLDER
  // =====================================================

  async function handleCreateFolder() {
    const name =
      window.prompt("Folder name");

    if (!name?.trim()) return;

    await createFolder(
      name.trim()
    );

    await loadFolders();

    window.dispatchEvent(
      new Event("conversation-updated")
    );
  }

  // =====================================================
  // DELETE FOLDER
  // =====================================================

  async function handleDeleteFolder(
    folderId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this folder?"
      );

    if (!confirmed) return;

    await deleteFolder(folderId);

    await loadFolders();
    await loadConversations();

    window.dispatchEvent(
      new Event("conversation-updated")
    );
  }

  // =====================================================
  // RENAME FOLDER
  // =====================================================

  async function finishFolderRename(
    folderId: string
  ) {
    const name =
      editingFolderName.trim();

    if (!name) return;

    await renameFolder(
      folderId,
      name
    );

    setEditingFolderId(null);
    setEditingFolderName("");

    await loadFolders();
  }

  // =====================================================
  // DRAG CHAT INTO FOLDER
  // =====================================================

  async function handleDragEnd(
    event: any
  ) {
    const { active, over } = event;

    if (!over) return;

    const conversationId =
      String(active.id);

    const folderId =
      String(over.id);

    await moveConversationToFolder(
      conversationId,
      folderId
    );

    await loadConversations();
    await loadFolders();

    window.dispatchEvent(
      new Event("conversation-updated")
    );
  }

  // =====================================================
  // CHAT ROW
  // =====================================================

  function renderChat(
    chat: Conversation
  ) {
    return (
      <ChatItem
        key={chat.id}
        id={chat.id}
      >
        <div
          className="
            group
            mb-0.5
            flex
            min-w-0
            items-center
            rounded-md
            transition
            hover:bg-zinc-800/70
          "
        >
          {/* Chat */}
          <button
            onClick={() =>
              router.push(
                `/chat/${chat.id}`
              )
            }
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-2
              rounded-md
              px-2.5
              py-2
              text-left
            "
          >
            <MessageSquare
              size={15}
              strokeWidth={1.8}
              className="
                shrink-0
                text-zinc-500
              "
            />

            {editingId === chat.id ? (
              <input
                autoFocus
                value={editingTitle}
                onChange={(e) =>
                  setEditingTitle(
                    e.target.value
                  )
                }
                onClick={(e) =>
                  e.stopPropagation()
                }
                onKeyDown={async (e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    await finishRename(
                      chat.id
                    );
                  }

                  if (
                    e.key === "Escape"
                  ) {
                    setEditingId(null);
                    setEditingTitle("");
                  }
                }}
                className="
                  min-w-0
                  flex-1
                  rounded-md
                  border
                  border-zinc-600
                  bg-zinc-800
                  px-2
                  py-1
                  text-sm
                  text-white
                  outline-none
                  focus:border-cyan-500
                "
              />
            ) : (
              <span
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-1.5
                  truncate
                  text-[13px]
                  text-zinc-300
                "
              >
                {/* PIN ICON */}
                {chat.pinned && (
                  <Pin
                    size={12}
                    strokeWidth={2}
                    className="
                      shrink-0
                      fill-cyan-400
                      text-cyan-400
                    "
                    title="Pinned"
                  />
                )}

                <span className="truncate">
                  {chat.title}
                </span>
              </span>
            )}
          </button>

          {/* Chat menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                mr-1
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
                text-zinc-600
                opacity-0
                transition
                hover:bg-zinc-700
                hover:text-white
                group-hover:opacity-100
              "
            >
              <MoreVertical
                size={15}
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                min-w-[150px]
                border-zinc-800
                bg-zinc-900
                text-white
              "
            >
              <DropdownMenuItem
                onClick={() =>
                  handleTogglePin(chat)
                }
              >
                <Pin
                  size={14}
                  className="mr-2"
                />

                {chat.pinned
                  ? "Unpin"
                  : "Pin"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setEditingId(
                    chat.id
                  );

                  setEditingTitle(
                    chat.title
                  );
                }}
              >
                <Pencil
                  size={14}
                  className="mr-2"
                />

                Rename
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-400 focus:text-red-400"
                onClick={() =>
                  handleDelete(chat.id)
                }
              >
                <Trash2
                  size={14}
                  className="mr-2"
                />

                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ChatItem>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <DndContext
      onDragEnd={handleDragEnd}
    >
      <aside
        className="
          flex
          h-full
          w-[250px]
          shrink-0
          flex-col
          border-r
          border-zinc-800
          bg-[#111113]
          text-white
        "
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            h-[58px]
            shrink-0
            items-center
            justify-between
            border-b
            border-zinc-800
            px-4
          "
        >
          <div className="min-w-0">
            <h2
              className="
                truncate
                text-sm
                font-semibold
                text-zinc-100
              "
            >
              AI Chat
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-zinc-500
              "
            >
              Your conversations
            </p>
          </div>

          {/* New Chat */}
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-cyan-500
              text-black
              transition
              hover:bg-cyan-400
              active:scale-95
            "
          >
            <Plus
              size={17}
              strokeWidth={2.2}
            />
          </button>
        </div>

        {/* =================================================
            SEARCH
        ================================================== */}

        <div
          className="
            shrink-0
            px-3
            py-3
          "
        >
          <div
            className="
              flex
              h-9
              items-center
              rounded-lg
              border
              border-zinc-800
              bg-zinc-900/80
              px-2.5
              transition
              focus-within:border-zinc-700
            "
          >
            <Search
              size={15}
              className="
                mr-2
                shrink-0
                text-zinc-500
              "
            />

            <input
              type="text"
              placeholder="Search chats"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[13px]
                text-white
                outline-none
                placeholder:text-zinc-600
              "
            />
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-2.5
            pb-5
          "
        >

          {/* =================================================
              PINNED
          ================================================== */}

          {pinnedChats.length > 0 && (
            <section className="mb-5">

              <div
                className="
                  mb-1.5
                  flex
                  items-center
                  gap-1.5
                  px-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-zinc-600
                "
              >
                <Pin size={11} />
                Pinned
              </div>

              {pinnedChats.map(
                renderChat
              )}

            </section>
          )}

          {/* =================================================
              RECENT
          ================================================== */}

          <section className="mb-5">

            <div
              className="
                mb-1.5
                px-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-zinc-600
              "
            >
              Recent
            </div>

            {loading ? (
              <p
                className="
                  px-2
                  py-2
                  text-xs
                  text-zinc-600
                "
              >
                Loading...
              </p>
            ) : recentChats.length === 0 ? (
              <p
                className="
                  px-2
                  py-2
                  text-xs
                  text-zinc-600
                "
              >
                No conversations yet
              </p>
            ) : (
              recentChats.map(
                renderChat
              )
            )}

          </section>

          {/* =================================================
              FOLDERS
          ================================================== */}

          <section>

            <div
              className="
                mb-1.5
                flex
                items-center
                justify-between
                px-2
              "
            >
              <div
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-zinc-600
                "
              >
                Folders
              </div>

              <button
                onClick={
                  handleCreateFolder
                }
                title="New Folder"
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-md
                  text-zinc-600
                  transition
                  hover:bg-zinc-800
                  hover:text-white
                "
              >
                <Plus size={14} />
              </button>
            </div>

            {folders.length === 0 ? (
              <button
                onClick={
                  handleCreateFolder
                }
                className="
                  mx-2
                  mt-1
                  flex
                  items-center
                  gap-2
                  rounded-md
                  py-2
                  text-xs
                  text-zinc-600
                  transition
                  hover:text-zinc-300
                "
              >
                <Folder size={14} />
                Create a folder
              </button>
            ) : (
              folders.map(
                (folder) => (
                  <FolderDropZone
                    key={folder.id}
                    id={folder.id}
                  >
                    <div className="mb-1">

                      {/* Folder Header */}
                      <div
                        className="
                          group
                          flex
                          items-center
                          rounded-md
                          transition
                          hover:bg-zinc-800/70
                        "
                      >

                        <button
                          onClick={() =>
                            setExpandedFolders(
                              (prev) => ({
                                ...prev,
                                [folder.id]:
                                  !prev[
                                    folder.id
                                  ],
                              })
                            )
                          }
                          className="
                            flex
                            min-w-0
                            flex-1
                            items-center
                            gap-2
                            rounded-md
                            px-2
                            py-2
                            text-left
                          "
                        >

                          {expandedFolders[
                            folder.id
                          ] ? (
                            <ChevronDown
                              size={14}
                              className="shrink-0 text-zinc-500"
                            />
                          ) : (
                            <ChevronRight
                              size={14}
                              className="shrink-0 text-zinc-500"
                            />
                          )}

                          <Folder
                            size={15}
                            className="
                              shrink-0
                              text-zinc-500
                            "
                          />

                          {editingFolderId ===
                          folder.id ? (
                            <input
                              autoFocus
                              value={
                                editingFolderName
                              }
                              onChange={(e) =>
                                setEditingFolderName(
                                  e.target.value
                                )
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              onKeyDown={async (
                                e
                              ) => {
                                if (
                                  e.key ===
                                  "Enter"
                                ) {
                                  await finishFolderRename(
                                    folder.id
                                  );
                                }

                                if (
                                  e.key ===
                                  "Escape"
                                ) {
                                  setEditingFolderId(
                                    null
                                  );

                                  setEditingFolderName(
                                    ""
                                  );
                                }
                              }}
                              className="
                                min-w-0
                                flex-1
                                rounded
                                border
                                border-zinc-600
                                bg-zinc-800
                                px-2
                                py-1
                                text-xs
                                text-white
                                outline-none
                              "
                            />
                          ) : (
                            <span
                              className="
                                truncate
                                text-[13px]
                                text-zinc-300
                              "
                            >
                              {folder.name}
                            </span>
                          )}

                        </button>

                        {/* Folder Rename */}
                        <button
                          onClick={() => {
                            setEditingFolderId(
                              folder.id
                            );

                            setEditingFolderName(
                              folder.name
                            );
                          }}
                          title="Rename folder"
                          className="
                            mr-0.5
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            text-zinc-600
                            opacity-0
                            transition
                            hover:bg-zinc-700
                            hover:text-white
                            group-hover:opacity-100
                          "
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Folder Delete */}
                        <button
                          onClick={() =>
                            handleDeleteFolder(
                              folder.id
                            )
                          }
                          title="Delete folder"
                          className="
                            mr-1
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            text-zinc-600
                            opacity-0
                            transition
                            hover:bg-red-500/20
                            hover:text-red-400
                            group-hover:opacity-100
                          "
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>

                      {/* Folder Contents */}
                      {expandedFolders[
                        folder.id
                      ] && (
                        <div
                          className="
                            ml-4
                            border-l
                            border-zinc-800
                            pl-2
                          "
                        >
                          {filteredConversations
                            .filter(
                              (chat) =>
                                chat.folder_id ===
                                folder.id
                            )
                            .map(
                              renderChat
                            )}

                          {filteredConversations.filter(
                            (chat) =>
                              chat.folder_id ===
                              folder.id
                          ).length === 0 && (
                            <p
                              className="
                                px-2
                                py-2
                                text-[11px]
                                text-zinc-600
                              "
                            >
                              Empty folder
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  </FolderDropZone>
                )
              )
            )}

          </section>

        </div>
      </aside>
    </DndContext>
  );
}