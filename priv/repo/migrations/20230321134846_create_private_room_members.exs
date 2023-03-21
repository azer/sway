defmodule Sway.Repo.Migrations.CreatePrivateRoomMembers do
  use Ecto.Migration

  def change do
    create table(:private_room_members) do
      add :room_id, references(:rooms, on_delete: :nothing)
      add :user_id, references(:users, on_delete: :nothing)

      timestamps()
    end

    create index(:private_room_members, [:room_id])
    create index(:private_room_members, [:user_id])
  end
end
