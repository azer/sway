defmodule Bafa.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :name, :string
      add :org_id, references(:orgs)

      timestamps()
    end
  end
end
