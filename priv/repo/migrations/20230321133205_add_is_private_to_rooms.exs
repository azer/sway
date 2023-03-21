defmodule Sway.Repo.Migrations.AddIsPrivateToRooms do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add :is_private, :boolean, default: false, null: false
    end
  end
end
