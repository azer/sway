defmodule Sway.Repo.Migrations.AddIsActiveAndUniqueConstraintToRooms do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add :is_active, :boolean, default: true
    end
    create unique_index(:rooms, [:slug, :org_id])
  end
end
