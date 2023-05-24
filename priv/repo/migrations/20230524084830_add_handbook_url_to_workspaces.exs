defmodule Sway.Repo.Migrations.AddHandbookUrlToWorkspaces do
  use Ecto.Migration

  def change do
    alter table(:workspaces) do
      add :handbook_url, :string
    end
  end
end
