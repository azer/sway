defmodule Sway.Repo.Migrations.SetIsActiveDefaultToTrue do
  use Ecto.Migration

    def up do
      execute("ALTER TABLE messages ALTER COLUMN is_active SET DEFAULT true")
    end

    def down do
      execute("ALTER TABLE messages ALTER COLUMN is_active DROP DEFAULT")
    end


end
