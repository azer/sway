defmodule Sway.Repo.Migrations.CreateWorkspaces do
  use Ecto.Migration

  def change do
    create table(:workspaces) do
      add :name, :string, null: false
      add :domain, :string, null: false
      add :logo_url, :string

      timestamps()
    end
  end
end
