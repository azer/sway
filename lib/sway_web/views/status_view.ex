defmodule SwayWeb.StatusView do
  use SwayWeb, :view
  alias SwayWeb.StatusView

  def render("index.json", %{statuses: statuses}) do
    %{data: render_many(statuses, StatusView, "status.json")}
  end

  def render("show.json", %{status: status}) do
    %{data: render_one(status, StatusView, "status.json")}
  end

  def render("status.json", %{status: status}) do
    encode(status)
  end

  def encode(status) do
    %{
      id: SwayWeb.Hashing.encode_status(status.id),
      user_id: SwayWeb.Hashing.encode_user(status.user_id),
      room_id: SwayWeb.Hashing.encode_room(status.room_id),
      workspace_id: SwayWeb.Hashing.encode_workspace(status.workspace_id),
      status: status.status,
      message: status.message,
      camera_on: status.camera_on,
      mic_on: status.mic_on,
      speaker_on: status.speaker_on,
      timezone: status.timezone,
      emoji: status.emoji,
      inserted_at: status.inserted_at
    }
  end
end
