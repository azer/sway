defmodule Bafa.Repo.Migrations.CleanStatus do
  use Ecto.Migration

  def change do
    alter table(:statuses) do
      remove :ended_at
      remove :started_at
      remove :org_id, references(:orgs)
      add :room_id, references(:rooms)
    end
  end
end
