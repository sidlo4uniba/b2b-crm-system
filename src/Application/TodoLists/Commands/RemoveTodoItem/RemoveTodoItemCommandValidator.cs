namespace CRMBackend.Application.TodoLists.Commands.RemoveTodoItem;

public class RemoveTodoItemCommandValidator : AbstractValidator<RemoveTodoItemCommand>
{
    public RemoveTodoItemCommandValidator()
    {
        RuleFor(v => v.ListId)
            .NotEmpty()
            .WithMessage("ListId is required.")
            .GreaterThan(0)
            .WithMessage("ListId must be greater than 0.");

        RuleFor(v => v.ItemId)
            .NotEmpty()
            .WithMessage("ItemId is required.")
            .GreaterThan(0)
            .WithMessage("ItemId must be greater than 0.");
    }
} 
