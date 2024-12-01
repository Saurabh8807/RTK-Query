import {createApi,fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const api = createApi({
    baseQuery:fetchBaseQuery({baseUrl:"http://localhost:3000"}),
    tagTypes:["Tasks"],
    endpoints:(builder)=>({
        getTasks:builder.query({
            query:()=>"/tasks",
            transformResponse:(tasks)=>tasks.reverse(),
            providesTags:["Tasks"],
        }),
        addTask:builder.mutation({
            query:(task)=>({
                url:"/tasks",
                method:"POST",
                body:task
            }),
            invalidatesTags:["Tasks"],
            async onQueryStarted(task,{dispatch,queryfulfilled}){
                const patchResult = dispatch(
                    api.util.updateQueryData("getTasks",undefined,(draft)=>{
                        draft.unshift({id:crypto.randomUUID(),...task})
                    })
                )
                try {
                    await queryfulfilled;
                } catch {
                    patchResult.undo()
                }
            } 
                
            
        }),
        updateTask:builder.mutation({
            query:(task)=>({
                url:`/tasks/${task.id}`,
                method:"PATCH",
                body:task
            }),
            invalidatesTags:["Tasks"],
            async onQueryStarted(task, { dispatch, queryFulfilled }) {
                // Optimistic update
                const patchResult = dispatch(
                  api.util.updateQueryData("getTasks", undefined, (draft) => {
                    // Find the index of the task to update
                    const todoIndex = draft.findIndex((el) => el.id === task.id);
                    if (todoIndex !== -1) {
                      // Update the task with new data
                      draft[todoIndex] = { ...draft[todoIndex], ...task };
                    }
                  })
                );
                try {
                  // Wait for the actual API call to succeed
                  await queryFulfilled;
                } catch {
                  // Undo the optimistic update if the API call fails
                  patchResult.undo();
                }
              },
        }),
        deleteTask:builder.mutation({
            query:(id)=>({
                url:`/tasks/${id}`,
                method:"DELETE",
            }),
            invalidatesTags:["Tasks"],
            async onQueryStarted(task,{dispatch,queryfulfilled}){
                const patchResult = dispatch(
                    api.util.updateQueryData("getTasks",undefined,(draft)=>{
                        draft.unshift({id:crypto.randomUUID(),...task})
                    })
                )
                try {
                    await queryfulfilled;
                } catch {
                    patchResult.undo()
                }
            }
        })

    })
})

export const {useGetTasksQuery,useAddTaskMutation,useUpdateTaskMutation,useDeleteTaskMutation} = api