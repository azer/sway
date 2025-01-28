defmodule SwayWeb.ChatMessageView do
  use SwayWeb, :view
  alias SwayWeb.ChatMessageView
  alias SwayWeb.APIView

  def links(view, message) do
    view
    |> APIView.add_link(:rooms, SwayWeb.RoomView, message.room_id)
    |> APIView.add_link(:users, SwayWeb.UserView, message.user_id)
  end

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, ChatMessageView, "chat_message.json") }
  end

  def render("show.json", %{message: message}) do
    %{data: render_one(message, ChatMessageView, "chat_message.json")}
  end

  def render("chat_message.json", %{message: message}) do
    encode(message)
  end

  def row(message) do
    APIView.row(encode(message), :cities)
  end

  def encode(message) do
    %{
      id: SwayWeb.Hashing.encode_message(message.id),
      user_id: SwayWeb.Hashing.encode_user(message.user_id),
      room_id: SwayWeb.Hashing.encode_room(message.room_id),
      body: message.body,
      is_active: message.is_active,
      edited_at: message.edited_at,
      thread_id: message.thread_id,
      inserted_at: message.inserted_at,
      updated_at: message.updated_at
    }
  end
end
