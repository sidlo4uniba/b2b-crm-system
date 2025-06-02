using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.Common.Models;

public class LookupDTO
{
    public int Id { get; init; }

    public string? Title { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TodoList, LookupDTO>();
            CreateMap<TodoItem, LookupDTO>();
        }
    }
}
