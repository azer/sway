defmodule SwayWeb.StatusView do
  use SwayWeb, :view
  alias SwayWeb.StatusView
  alias SwayWeb.APIView

  def links(view, status) do
    view
    |> APIView.add_room(status.room_id)
    |> APIView.add_user(status.user_id)
    |> APIView.add_workspace(status.workspace_id)
  end

  def render("index.json", %{statuses: statuses}) do
    %{
      list: render_many(statuses, StatusView, "status.json"),
      links: APIView.links(:statuses, StatusView, statuses)
    }
  end

  def render("show.json", %{status: status}) do
    %{ result: render_one(status, StatusView, "status.json") }
  end

  def render("status.json", %{status: status}) do
    APIView.row(encode(status), :statuses)
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
