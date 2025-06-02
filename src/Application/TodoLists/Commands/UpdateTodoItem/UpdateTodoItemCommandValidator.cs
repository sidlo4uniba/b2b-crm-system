using FluentValidation;

namespace CRMBackend.Application.TodoLists.Commands.UpdateTodoItem;

public class UpdateTodoItemCommandValidator : AbstractValidator<UpdateTodoItemCommand>
{
    public UpdateTodoItemCommandValidator()
    {
        RuleFor(v => v.ListId)
            .NotNull().WithMessage("ListId is required.")
            .GreaterThan(0).WithMessage("ListId must be greater than 0.");

        RuleFor(v => v.ItemId)
            .NotNull().WithMessage("ItemId is required.")
            .GreaterThan(0).WithMessage("ItemId must be greater than 0.");

        RuleFor(v => v.Title)
            .NotNull().WithMessage("Title is required.")
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(v => v.Done)
            .NotNull().WithMessage("Done status is required.");
    }
} 