defmodule Sway.Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset

  schema "messages" do
    field :body, :string
    field :edited_at, :utc_datetime
    field :is_active, :boolean, default: true

    belongs_to :room, Sway.Rooms.Room
    belongs_to :user, Sway.Accounts.User
    belongs_to :thread, Sway.Chat.Message, foreign_key: :thread_id

    timestamps()
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:body, :user_id, :room_id, :thread_id, :edited_at, :is_active])
    |> validate_required([:body, :user_id, :room_id])
  end
end
