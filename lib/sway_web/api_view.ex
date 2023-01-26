defmodule SwayWeb.APIView do
  def render_relationships(struct, associations) do
    Enum.reduce(associations, %{}, fn(assoc, acc) ->
      Map.put(acc, assoc, Map.get(struct, assoc))
    end)
  end
end
