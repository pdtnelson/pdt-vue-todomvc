<template>
    <section class="todoapp" v-cloak>
        <header class="header">
            <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" v-model="newTodo" @keyup.enter="addTodo">
        </header>
        <section class="main" v-show="todos.length">
            <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone">
            <label for="toggle-all">Mark all as complete</label>
            <ul class="todo-list">
                <li class="todo" v-for="todo in filteredTodos" :key="todo.id" :class="{completed: todo.completed, editing: todo == editedTodo}">
                    <div class="view">
                        <input class="toggle" type="checkbox" v-model="todo.completed" @click="syncCompleted(todo)">
                        <label @dblclick="editTodo(todo)">{{todo.title}}</label>
                        <button class="destroy" @click="removeTodo(todo)"></button>
                    </div>
                    <input class="edit" type="text" v-model="todo.title" v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)" @keyup.enter="doneEdit(todo)" @keyup.esc="cancelEdit(todo)">
                </li>
            </ul>
        </section>
        <footer class="footer" v-show="todos.length">
            <span class="todo-count">
                <!-- <strong v-text="remaining"></strong> {{pluralize('item', remaining)}} left -->
            </span>
            <ul class="filters">
                <li><a @click="setVisibility('all')" :class="{selected: visibility == 'all'}">All</a></li>
                <li><a @click="setVisibility('active')" :class="{selected: visibility == 'active'}">Active</a></li>
                <li><a @click="setVisibility('completed')" :class="{selected: visibility == 'completed'}">Completed</a></li>
            </ul>
            <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
                Clear completed
            </button>
        </footer>
    </section>
</template>

<script>
export default {
    name: 'ToDo',
    data() {
        return {
			todos: [],
			newTodo: '',
			editedTodo: null,
			visibility: 'all'
		}
    },
    computed: {
        filteredTodos: function () {
            return this.filterTodos(this.visibility)
        },
        remaining: function () {
            return this.filterTodos('active')
        },
        allDone: {
            get: function () {
                return this.remaining === 0;
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value;
                });
            }
        }
    },
    methods: {
        filterTodos(visibility) {
            switch(visibility) {
                case 'all':
                    return this.todos;
                case 'active':
                    return this.todos.filter((todo) => {
                        return !todo.completed
                    });
                case 'completed':
                    return this.todos.filter((todo) => {
                        return todo.completed
                    })
                default:
                    return null
            }

        },
        setVisibility(visibility) {
            this.visibility = visibility
        },
        async syncCompleted(todo) {
            try {
                todo.completed = !todo.completed
                await this.$http.patch(`/todo/${todo.ID}`, todo)
                this.fetchTodos()
            } catch (error) {
                alert('There was an error updating your todo. Please try again or refresh the page.')
                todo.completed = !todo.completed
            }
        },
        async fetchTodos() {
            try {
                const response = await this.$http.get('/todo')
                this.todos = response.data
            } catch (error) {
                // eslint-disable-next-line
                console.error('Failed to load todo\'s: ', error)
            }
        },
        pluralize: function (word, count) {
            return word + (count === 1 ? '' : 's');
        },
        async addTodo() {
            const data = {
                title: this.newTodo,
                description: '',
                complete: false
            }
            try {
                await this.$http.post('/todo', data)
                this.fetchTodos()
                this.newTodo = '';
            } catch (error) {
                // eslint-disable-next-line
                console.error(error)
                alert("There was a problem submitting your ToDo. Please check your input and try again.")
            }
        },
        editTodo(todo) {
            this.beforeEditCache = todo.title;
            this.editedTodo = todo;
        },
        doneEdit(todo) {
            if (!this.editedTodo) {
                return;
            }
            this.editedTodo = null;
            todo.title = todo.title.trim();
            if (!todo.title) {
                this.removeTodo(todo);
            }
        },
        cancelEdit(todo) {
            this.editedTodo = null;
            todo.title = this.beforeEditCache;
        },
        async removeTodo(todo) {
            try {
                await this.$http.delete(`/todo/${todo.ID}`)
                this.fetchTodos()
            } catch (error) {
                alert('We had a problem deleting that ToDo. Try again or refresh the page.')
            }
        },
        removeCompleted() {
            this.todos = this.filters.active(this.todos);
        }
    },
    mounted() {
        this.fetchTodos()
    }
}
</script>
