using System.Diagnostics;
using Plainquire.Filter.Abstractions;
using CRMBackend.Domain.Events;

namespace CRMBackend.Domain.Entities;

[EntityFilter(Prefix = "")]
public class TodoList : BaseAuditableEntity, IAggregateRoot
{
    private const int DefaultMaxItems = 10;

    public required string Title { get; set; }
    public string? Description { get; private set; }
    public Colour Colour { get; private set; } = Colour.White;
    public int MaxItems { get; private set; } = DefaultMaxItems;

    private readonly List<TodoItem> _items = new();
    public IEnumerable<TodoItem> Items => _items.AsReadOnly();

    public void SetDescription(string? description) {
        Description = description;
    }
    
    public void SetColour(Colour colour)
    {
        Colour = colour;
    }

    public void SetMaxItems(int maxItems)
    {
        if (maxItems < 1)
            throw new DomainValidationException("Max items must be at least 1");
        if (maxItems < _items.Count)
            throw new DomainValidationException("Max items cannot be less than current item count");

        MaxItems = maxItems;
    }

    public void AddItem(TodoItem item)
    {
        if (_items.Count >= MaxItems)
            throw new DomainValidationException("Maximum item count reached");
        if (_items.Any(i => i.Title == item.Title))
            throw new DomainValidationException("Duplicate item title not allowed");

        _items.Add(item);
        AddDomainEvent(new TodoItemCreatedEvent(item));
    }

    public void RemoveItem(int itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
        }
    }
}
