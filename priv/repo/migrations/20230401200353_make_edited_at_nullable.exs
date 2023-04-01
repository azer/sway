defmodule Sway.Repo.Migrations.MakeEditedAtNullable do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      modify :edited_at, :naive_datetime, null: true
    end
  end
end
