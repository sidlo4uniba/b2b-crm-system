using FluentValidation;

namespace CRMBackend.Application.TodoLists.Commands.DeleteTodoList;

public class DeleteTodoListCommandValidator : AbstractValidator<DeleteTodoListCommand>
{
    public DeleteTodoListCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty()
            .WithMessage("Id is required.")
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0.");
    }
} 