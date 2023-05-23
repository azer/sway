defmodule Sway.Repo.Migrations.AddIsActiveToRoomMembers do
  use Ecto.Migration

  def change do
    alter table(:room_members) do
      add :is_active, :boolean, default: true
    end
  end
end
